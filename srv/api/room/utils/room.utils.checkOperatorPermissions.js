/**
 * Created by Zaccary on 25/01/2016.
 */


const RoomUtils = require('../room.utils');
const UserUtils = require('../../user/user.utils');
const log = require('../../../utils/logger.util')({ name: 'room.utils.checkOperatorPermissions' });
const errors = require('../../../config/constants/errors');
const getUserRoles = require('../../role/controllers/getUserRoles.controller');

/**
 * Check the user has the permissions required to perform
 * an operator action. Calls back with true or false depending
 * on whether the user has permissions.
 *
 * @param {string} socketId - the socket ID of the user performing the action
 * @param {string} action - Action to be taken. Should be same as mod permissions key from room obj
 * @param {function} cb - callback
 */
module.exports = function checkOperatorPermissions(socketId, action, cb) {
  RoomUtils.getSocketCacheInfo(socketId, (err, data) => {
    if (err) {
      log.fatal({ err }, 'failed to get socket cache info');
      return cb(err);
    }

    if (!data) {
      const error = new Error('ERR_MISSING_CACHE');
      log.error({ err: error }, 'cache data is missing');
      return cb(error);
    }

    return RoomUtils.getRoomByName(data.name, (err, room) => {
      if (err) {
        log.fatal({ err }, 'error fetching room');
        return cb(err);
      }

      if (!room) {
        log.error('no room');
        return cb(errors.ERR_NO_ROOM);
      }

      const modUser = room.users.find(user => user.socket_id === socketId);

      if (!modUser) {
        log.error('no user found');
        return cb(null, false);
      }

      return UserUtils.getUserById(modUser.user_id, async (err, user) => {
        if (err) {
          log.fatal({ err }, 'error finding user');
          return cb(err);
        }

        if (!user && modUser.user_id) {
          log.error('error finding op user');
          return cb('ERR_NO_USER');
        }

        if (user && user.attrs.userLevel === 30) {
          log.info(`Admin user ${user._id} performed ${action} in room ${room.name}`);
          return cb(null, true);
        }


        let hasPermission;
        try {
          const roles = await getUserRoles({ userListId: modUser._id, roomName: room.name });
          hasPermission = roles.some(role => role.permissions[action]);
        } catch (err) {
          return cb(err);
        }

        if (!hasPermission) {
          log.warn(`Unauthorized operator action (${action}) attempted by ${modUser._id}`);
        }

        return cb(null, hasPermission);
      });
    });
  });
};
