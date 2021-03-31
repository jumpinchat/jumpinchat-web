/**
 * Created by Zaccary on 19/10/2015.
 */

const log = require('../../../utils/logger.util')({ name: 'room.getRoom' });
const RoomUtils = require('../room.utils');
const roomCreate = require('./room.create');
const roomController = require('../room.controller');

function initializeJanusRoom(room, cb) {
  const janusRoomId = room.attrs.janus_id;
  const { janusServerId } = room.attrs;

  if (!janusRoomId || !janusServerId) {
    log.debug({ roomAttrs: room.attrs, roomUsers: room.users.length }, 'creating new janus room');
    return RoomUtils.createJanusRoom(null, cb);
  }

  return RoomUtils.checkForJanusRoom(janusServerId, janusRoomId, (err, roomExists) => {
    if (err) {
      log.fatal({ err }, 'failed to check for janus room');
      return cb(err);
    }

    if (roomExists) {
      log.info({ janusRoomId, janusServerId }, 'janus room exists');
      return cb(null, janusRoomId, janusServerId);
    }

    const newJanusId = RoomUtils.createUniqueIntegerId();

    log.info({ newJanusId }, 'creating new janus room');
    return RoomUtils.createJanusRoom(null, cb);
  });
}


function setUp(req, res, name) {
  const io = roomController.getSocketIo();
  let ip;

  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for']
      .split(',')
      .map(s => s.trim())[0];
  } else {
    ip = req.connection.remoteAddress;
  }

  // find the room in the database by it's name
  return RoomUtils.getRoomByName(name, (err, room) => {
    if (err) {
      log.fatal({ room, err }, 'error fetching room');
      return res.status(404).send();
    }

    // if the room exists, set up params to join the room as a
    // guest, or if the user is logged in, as the logged in user
    if (room) {
      const roomObj = Object.assign({}, room.toObject(), {
        users: RoomUtils.checkModAssignedBy(room),
      });

      return io.in(name).clients((err, clients) => {
        if (err) {
          log.fatal({ err, roomName: name }, 'error fetching socket clients');
        }

        room.users = room.users.filter(user => clients.includes(user.socket_id));

        return initializeJanusRoom(roomObj, (err, janusRoomId, janusServerId) => {
          if (err) {
            log.fatal({ err }, 'failed to init janus room');
            return res.status(500).end();
          }

          res.cookie('janus_id', janusServerId, {
            maxAge: 1000 * 60 * 60 * 24,
            signed: false,
            httpOnly: true,
          });


          room.attrs.janus_id = janusRoomId;
          room.attrs.janusServerId = janusServerId;

          room.save((err, savedRoom) => {
            if (err) {
              log.fatal({ err }, 'failed to save room');
              return res.status(500).end();
            }

            return res.status(200).send({
              ...RoomUtils.filterRoom(savedRoom),
              users: [],
            });
          });
        });
      });
    }

    log.debug({ roomName: name }, 'create new room');

    const newRoom = {
      name,
      ip,
      sessionId: req.sessionID,
    };

    // null sent as user argument, since the room isn't being created
    // as a user is being registered. Despite being logged into an account,
    // it is still being treated as a temporary room
    return roomCreate(newRoom, null, (roomCreateErr, createdRoom) => {
      if (roomCreateErr) {
        log.fatal({ err: roomCreateErr }, 'error creating new room');
        return res.status(403).send();
      }

      log.info({ roomName: createdRoom.name }, 'new room created successfully');

      res.cookie('janus_id', createdRoom.attrs.janusServerId, {
        maxAge: 1000 * 60 * 60 * 24,
        signed: false,
        httpOnly: true,
      });


      return res.status(201).send(RoomUtils.filterRoom(createdRoom));
    });
  });
}

/**
 * GET api/rooms/:room
 *
 * Called when a user navigates to /:room
 * checks for the existence of the room and
 * if it exists, and is active, will open it.
 *
 * If the room doesn't exist or is not active, however,
 * it will instead create a new room with the
 * :name parameter as the room name
 *
 * @param req
 * @param res
 */
module.exports = function getRoom(req, res) {
  const name = req.params.room;

  setUp(req, res, name);
};
