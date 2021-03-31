
const log = require('../../../utils/logger.util')({ name: 'user.remove' });
const userUtils = require('../user.utils');
const roomUtils = require('../../room/room.utils');
const { cancelSubscription } = require('../../payment/payment.utils');
const { removeRoomRoles, removeRoomEnrollments } = require('../../role/role.utils');
const errors = require('../../../config/constants/errors');

module.exports = async function removeUser(req, res) {
  const { user } = req;
  const { userId } = req.params;

  if (userId !== String(user._id)) {
    log.error({ userId, requestingUser: user }, 'user attempted to remove another account');
    return res.status(403).send(errors.ERR_AUTH);
  }

  try {
    await cancelSubscription(userId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      log.info('User does not have an existing subscription');
    } else {
      log.fatal({ err, userId }, 'failed to cancel subscription');
      return res.status(500).send(errors.ERR_SRV);
    }
  }

  try {
    await userUtils.removeUser(userId);
  } catch (err) {
    log.fatal({ err }, 'failed to remove user');
    return res.status(500).send();
  }

  log.info({ userId }, 'removed user');

  let room;

  try {
    room = await roomUtils.getRoomByName(user.username);
  } catch (err) {
    log.fatal({ err, roomName: user.username }, 'failed to get room');
  }

  try {
    await removeRoomRoles(room._id);
  } catch (err) {
    log.fatal({ err, room: room._id }, 'failed to remove room roles');
    return res.status(500).send(errors.ERR_SRV.message);
  }

  try {
    await removeRoomEnrollments(room._id);
  } catch (err) {
    log.fatal({ err, room: room._id }, 'failed to remove user enrollments');
    return res.status(500).send(errors.ERR_SRV.message);
  }

  return roomUtils.removeRoomByUserId(userId, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to remove room');
      return res.status(500).send();
    }

    log.info({ userId, username: user.username }, 'removed room');

    return res.status(204).send();
  });
};
