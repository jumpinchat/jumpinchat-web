/**
 * Created by Zaccary on 24/10/2015.
 */

const log = require('../../../utils/logger.util')({ name: 'room.sanitize' });
const roomController = require('../room.controller');
const roomUtils = require('../room.utils');
const redis = require('../../../lib/redis.util')();

const clearOldSessionData = (socketId) => {
  redis.del(socketId, (err) => {
    if (err) {
      log.fatal({ err, socketId }, 'failed to remove session data');
      return;
    }

    log.debug({ socketId }, 'removed old session data');
  });
};

/**
 * remove all users who's sockets have disconnected
 *
 * @param name
 * @param cb
 */
module.exports = function sanitizeUserList(name, cb) {
  log.debug({ roomName: name }, 'sanitizeUserList');
  const io = roomController.getSocketIo();

  io.in(name).clients((err, clients) => {
    if (err) {
      log.fatal({ err, roomName: name }, 'error fetching socket clients');
    }

    log.debug({ clients, roomName: name }, 'socketio clients');

    roomUtils.getRoomByName(name, (err, room) => {
      if (err) {
        log.fatal({ err, room: name }, 'failed to fetch room');
        return cb(err);
      }

      if (!room) {
        log.debug({ room: name }, 'room has already been removed');
        return cb(null);
      }

      const usersToBeRemoved = room.users
        .map(user => user.socket_id)
        .filter(socket => !clients.includes(socket));

      log.debug({ usersToBeRemoved }, 'removing sockets');

      usersToBeRemoved
        .forEach((socket) => {
          log.debug({ socket }, 'removing socket');
          roomController.leaveRoom(socket, (err) => {
            if (err) {
              log.error({ err, socket }, 'failed to force socket out of the room');
              const removeUserCb = (err) => {
                if (err) {
                  log.error({ err }, 'failed to remove user from room');
                }
              }

              if (err === 'ERR_NO_DATA') {
                roomUtils.addToRemoveUserQueue(socket, name, removeUserCb);
              }
            } else {
              log.debug({ socket }, 'socket removed');
            }
          });

          clearOldSessionData(socket);
        });

      return cb();
    });
  });
};
