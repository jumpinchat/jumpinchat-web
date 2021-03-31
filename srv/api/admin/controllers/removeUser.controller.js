const log = require('../../../utils/logger.util')({ name: 'utils' });
const userUtils = require('../../user/user.utils');
const roomUtils = require('../../room/room.utils');

module.exports = function removeUser(req, res) {
  const { userId } = req.params;

  return userUtils.removeUser(userId, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to remove user');
      return res.status(500).send();
    }

    log.info({ userId }, 'removed user');

    return roomUtils.removeRoomByUserId(userId, (err) => {
      if (err) {
        log.fatal({ err }, 'failed to remove room');
        return res.status(500).send();
      }

      log.info({ userId }, 'removed room');

      return res.status(204).send();
    });
  });
};
