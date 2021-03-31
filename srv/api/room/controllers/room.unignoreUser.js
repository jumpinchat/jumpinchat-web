const log = require('../../../utils/logger.util')({ name: 'unignoreUser.socket' });
const { getUserById } = require('../../user/user.utils');
const { getSocketCacheInfo } = require('../room.utils');
const errors = require('../../../config/constants/errors');

module.exports = function unignoreUserController(id, socketId, cb) {
  log.debug({ id, socketId }, 'unignore user');
  return getSocketCacheInfo(socketId, async (err, socketData) => {
    if (err) {
      log.fatal({ err }, 'unable to get socket cache');
      return cb(errors.ERR_SRV);
    }

    if (socketData.userId) {
      try {
        const user = await getUserById(socketData.userId, { lean: false });
        user.settings.ignoreList = user.settings.ignoreList
          .filter(i => i.id !== id);

        return user.save((err) => {
          if (err) {
            log.fatal({ err }, 'error saving user');
          }

          return cb();
        });
      } catch (err) {
        log.fatal({ err }, 'error fetching user');
        return cb(errors.ERR_SRV);
      }
    }

    return cb();
  });
};
