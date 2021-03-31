const RoomUtils = require('../../room.utils');
const log = require('../../../../utils/logger.util')({ name: 'room.kickUser' });
const { createError } = require('../../../../utils/utils');
const errors = require('../../../../config/constants/errors');
const config = require('../../../../config/env');

const getOperator = (room, userToBan) => room.settings.moderators
  .find(m => String(m._id) === String(userToBan.operator_id));

module.exports = function kickUser(req, res) {
  const { sessionStore, sessionID } = req;
  checkOperatorPermissions(socket.id, 'kick', (err, userIsMod) => {
    if (err) {
      log.fatal({ err }, 'error muting user chat');
      return socket.emit('client::error',
        {
          context: 'banner',
          error: err,
          message: 'error silencing user',
        });
    }

    if (!userIsMod) {
      return socket.emit('client::error',
        {
          context: 'alert',
          error: err,
          message: 'you do not have permissions to do this',
        });
    }
  });
};
