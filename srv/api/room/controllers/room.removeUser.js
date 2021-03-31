/**
 * Created by Zaccary on 19/10/2015.
 */

const RoomUtils = require('../room.utils');
const log = require('../../../utils/logger.util')({ name: 'room.removeUser' });
const roomRemove = require('./room.remove');

module.exports = function removeUserFromRoom(socketId, roomData, cb) {
  let removedUser;

  RoomUtils.getRoomByName(roomData.name, (err, room) => {
    if (err) {
      return cb(err);
    }

    if (!room) {
      return cb('ERR_NO_ROOM');
    }

    room.users = room.users.filter((user) => {
      if (user.socket_id === socketId) {
        removedUser = user;
        return false;
      }

      return true;
    });

    return room.save((err, savedRoom) => {
      if (err) {
        return cb(err);
      }

      // if removing the user causes the room to be empty, and if
      // the room is not a user room, it should be removed.
      if (!savedRoom.users.length) {
        log.debug('room empty, attempting to remove it');
        return roomRemove(roomData, cb);
      }

      return cb(null, removedUser);
    });
  });
};
