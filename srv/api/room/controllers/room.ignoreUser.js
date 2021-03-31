const uuid = require('uuid');
const log = require('../../../utils/logger.util')({ name: 'ignoreUser' });
const { getRoomByName } = require('../room.utils');
const { getUserById } = require('../../user/user.utils');
const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');

/**
 * @param {String} roomName - name of the room
 * @param {String} socketId - socket ID of the user who wants to ignore the target
 * @param {String} targetListId - user list ID of the user to be ignored in the room
 */
module.exports = async function ignoreUser(roomName, socketId, targetListId, cb) {
  try {
    const room = await getRoomByName(roomName);

    if (!room) {
      log.error({ roomName }, 'room not found');
      return cb(errors.ERR_NO_ROOM);
    }

    const targetUser = room.users.find(u => String(u._id) === targetListId);

    if (!targetUser) {
      log.error({ userListId: targetListId }, 'target user not found');
      return cb(errors.ERR_NO_USER);
    }

    const initiatingUser = room.users.find(u => u.socket_id === socketId);
    if (!initiatingUser) {
      log.error({ socketId }, 'could not find user by socket ID');
      return cb(errors.ERR_NO_USER);
    }

    const user = await getUserById(initiatingUser.user_id, { lean: false });

    const ignoreData = {
      id: uuid.v4(),
      handle: targetUser.handle,
      userListId: targetUser._id,
      userId: targetUser.user_id,
      sessionId: targetUser.session_id,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + config.room.ignoreTimeout),
    };

    if (user) {
      user.settings.ignoreList = [
        ...user.settings.ignoreList,
        ignoreData,
      ];

      user.save((err) => {
        if (err) {
          log.fatal({ err }, 'error saving user');
        }

        log.debug('ignore list item saved to user settings');
      });
    }

    return cb(null, ignoreData);
  } catch (err) {
    log.fatal({ err });
    return cb(errors.ERR_SRV);
  }
};
