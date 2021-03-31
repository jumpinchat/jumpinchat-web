const log = require('../../../utils/logger.util')({ name: 'admin.closeRoom' });
const errors = require('../../../config/constants/errors');
const roomCloseUtils = require('../../roomClose/roomClose.utils');
const adminUtils = require('../admin.utils');
const adminConstants = require('../admin.constants');

module.exports = async function closeRoom(req, res) {
  const { roomName } = req.params;
  const {
    reason,
    duration,
  } = req.body;

  let newClose;
  try {
    newClose = await roomCloseUtils.closeRoom(roomName, reason, duration);
  } catch (err) {
    log.fatal({ err }, 'failed to close room');
    return res.status(500).send(errors.ERR_SRV);
  }

  try {
    const action = {
      type: adminConstants.activity.ROOM_CLOSE,
      id: String(newClose._id),
    };

    await adminUtils.addModActivity(req.user._id, action);
  } catch (err) {
    log.fatal({ err }, 'error adding acitivity entry');
    return res.status(500).send();
  }

  return res.status(201).send(newClose);
};
