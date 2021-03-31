const log = require('../../../utils/logger.util')({ name: 'updateSession' });
const RoomUtils = require('../../room/room.utils');
const UserSocket = require('../user.socket');
const redis = require('../../../lib/redis.util')();
const { NotFoundError } = require('../../../utils/error.util');

function updateRoomSocketInfo(roomName, oldSocket, newSocket, cb) {
  RoomUtils.getRoomByName(roomName, (err, room) => {
    if (err) {
      log.fatal({ err, roomName }, 'failed to get room');
      return cb(err);
    }

    if (!room) {
      log.error({ roomName }, 'Room not found');
      return cb('ERR_NO_ROOM');
    }

    const userExistsInRoom = room.users.some(u => u.socket_id === oldSocket);

    if (!userExistsInRoom) {
      return cb(new NotFoundError('Not currently in user list, please refresh to rejoin'));
    }

    room.users = room.users.map((user) => {
      if (user.socket_id === oldSocket) {
        user.socket_id = newSocket;
      }

      return user;
    });

    room.save((err) => {
      if (err) {
        log.fatal({ err }, 'error saving new socket');
        return cb(err);
      }

      return cb(null);
    });
  });
}

function setNewId(newId, oldId, roomData, cb) {
  redis.hmset(newId, roomData, (err) => {
    if (err) {
      log.fatal({ err }, 'error pushing room name into redis socket list');
      return cb(err);
    }

    // delete old socket info
    redis.del(oldId, (err) => {
      if (err) {
        log.fatal({ err }, 'failed to delete old redis session');
        return cb(err);
      }

      // rejoin socket into room
      const io = UserSocket.getIo();

      if (!io) {
        const error = new Error('ERR_NO_SIO');
        error.message = 'Socket IO not initialized';
        log.fatal({ err: error.toString() }, 'socket IO not initialized');
        return cb(error);
      }

      io.of('/').adapter.clients((err, clients) => {
        if (err) {
          log.fatal({ err }, 'failed to get connected sockets');
          return cb(err);
        }

        const newSocket = clients.find(c => c === newId);

        if (!newSocket) {
          log.fatal({ newId }, 'new socket connection not found');
          return cb(new Error('new socket connection not found'));
        }

        return io.of('/').adapter.remoteJoin(newSocket, roomData.name, (err) => {
          if (err) {
            log.fatal({ err }, 'failed to join new socket to room');
            return cb(err);
          }

          updateRoomSocketInfo(roomData.name, oldId, newId, (err) => {
            if (err) {
              log.fatal({ err }, 'failed to update socket info');
              return cb(err);
            }

            log.info({ newId, oldId, room: roomData.name }, 'updated room cache info');

            log.info({ newId, oldId, room: roomData.name }, 'reconnected socket to room');

            return cb();
          });
        });
      });
    });
  });
}

module.exports = function updateSession(req, res) {
  const { oldId, newId } = req.params;

  RoomUtils.getSocketCacheInfo(oldId, (err, socketData) => {
    if (err) {
      log.fatal({ err });
      res.status(500).send();
      return;
    }

    // save roomData object stored from redis as new obj
    // to be stored under new id
    const roomData = {
      ...socketData,
      disconnected: false,
    };

    if (!Object.keys(roomData).length) {
      log.error({ oldId }, 'no session data for socket');
      res.status(403).send();
      return;
    }

    // set room data in redis under new socket id
    setNewId(newId, oldId, roomData, (err) => {
      if (err) {
        return res.status(403).send();
      }

      return res.status(200).send();
    });
  });
};
