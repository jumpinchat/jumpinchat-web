const log = require('../../../utils/logger.util')({ name: 'privateMessage.socket' });
const roomUtils = require('../room.utils');
const userUtils = require('../../user/user.utils');

function sendToExistingUser(target, socketId, userListId, cb) {
  return userUtils.getUserById(target.userId, (err, user) => {
    if (err) {
      log.fatal({ err }, 'failed to get user');
      return cb({
        message: 'failed to send message',
      });
    }

    if (!user) {
      log.error({ userId: target.userId }, 'user not found');
      return cb({
        message: 'User not found',
      });
    }


    if (!user.settings.allowPrivateMessages) {
      return cb({
        message: 'user does not allow private messages',
      });
    }


    log.debug({ socketId: target.socketId }, 'target is registered');

    return cb(null, target.socketId);
  });
}

module.exports = function privateMessageController(roomName, socketId, userListId, cb) {
  roomUtils.getSocketIdFromListId(String(userListId), (err, targetSocketId) => {
    if (err) {
      log.fatal({ err }, 'failed to get list ID data');
      return cb({
        message: 'failed to send message',
      });
    }

    if (!targetSocketId) {
      log.debug('no socket id found');
      return roomUtils.getSocketIdFromRoom(roomName, String(userListId), (err, target) => {
        if (err) {
          log.fatal({ err }, 'failed to get socket ID from room');
          return cb({
            message: 'failed to send message',
          });
        }

        if (target.userId) {
          log.debug({ userId: target.userId }, 'target is registered');
          return sendToExistingUser(target, socketId, userListId, cb);
        }

        log.debug({ socketId: target.socketId }, 'target is guest');
        return cb(null, target.socketId);
      });
    }

    log.debug({ targetSocketId }, 'found target ID');

    return cb(null, targetSocketId);
  });
};
