const log = require('../../../utils/logger.util')({ name: 'room.utils' });
const errors = require('../../../config/constants/errors');
const { getRoomByName } = require('../../room/room.utils');
const { getUserById } = require('../../user/user.utils');

module.exports = async function setAgeRestricted(req, res) {
  const { roomName } = req.params;
  const identId = String(req.user._id);

  try {
    const room = await getRoomByName(roomName);
    const user = await getUserById(identId, { lean: true });

    if (String(room.attrs.owner) !== identId) {
      log.error({ userId: identId, owner: room.attrs.owner }, 'user not room owner');
      return res.status(403).send(errors.ERR_NOT_OWNER);
    }

    if (!user.auth.email_is_verified) {
      return res.status(403).send({
        error: 'ERR_EMAIL_NOT_VERIFIED',
        message: 'A verified email is required',
      });
    }

    room.attrs.ageRestricted = true;
    room.settings.forceUser = true;
    room.settings.public = false;
    room.attrs.ageRestricted = true;
    return room.save((err) => {
      if (err) {
        log.fatal({ err }, 'failed to save room');
        return res.status(500).send(errors.ERR_SRV);
      }

      return res.status(200).send();
    });
  } catch (err) {
    log.fatal({ err }, 'error getting room');
    return res.status(500).send(errors.ERR_SRV);
  }
};
