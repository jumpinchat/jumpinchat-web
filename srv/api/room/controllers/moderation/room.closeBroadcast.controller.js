const log = require('../../../../utils/logger.util')({ name: 'closeBroadcast.controller' });
const RoomUtils = require('../../room.utils');

module.exports = function closeBroadcast(roomName, userId, cb) {
  if (!userId) {
    log.error('user ID is missing');
    return cb({
      err: 'ERR_NO_USER_ID',
      message: 'Error closing broadcast',
    });
  }
  return RoomUtils.getRoomByName(roomName, (err, room) => {
    if (err) {
      log.fatal({ err }, 'error getting room');
      return cb({
        err,
        message: 'An unexpected error occurred',
      });
    }

    if (!room) {
      log.error({ roomName }, 'room not found');
      return cb({
        err: 'ERR_NO_ROOM',
        message: 'The room does not exist',
      });
    }

    const userToClose = room.users.find(u => String(u._id) === String(userId));

    if (!userToClose) {
      log.error({ userId }, 'user not found');
      return cb({
        err: 'ERR_NO_USER',
        message: 'Can not find user',
      });
    }

    if (!userToClose.isBroadcasting) {
      log.error('attempted to close a nonexistant broadcast');
      return cb({
        err: 'ERR_USER_NOT_BROADCASTING',
        message: 'User is not broadcasting',
      });
    }

    return cb(null, userToClose);
  });
};
