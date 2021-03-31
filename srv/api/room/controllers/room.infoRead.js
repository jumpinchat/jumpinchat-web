const log = require('../../../utils/logger.util')({ name: 'room.infoRead' });
const Joi = require('joi');
const roomUtils = require('../room.utils');

module.exports = function infoRead(req, res) {
  const schema = Joi.object().keys({
    room: Joi.string().required(),
  });

  Joi.validate(req.params, schema, (err, validated) => {
    if (err) {
      log.warn({ err }, 'invalid room name');
      return res.status(400)
        .send({ error: 'ERR_VALIDATION', message: 'Invalid room ID' });
    }

    log.debug({ token: validated.token }, 'verifying reset token');
    return roomUtils.getRoomById(validated.room, (err, room) => {
      if (err) {
        log.fatal({ err }, 'error getting room');
        return res.status(500).send({ error: 'ERR_SRV' });
      }

      if (!room) {
        log.warn({ roomName: room.name }, 'room not found');
        return res.status(404).send({ error: 'ERR_NO_ROOM' });
      }

      room.attrs.fresh = false;
      return room.save((err) => {
        if (err) {
          log.fatal({ err }, 'error saving room');
          return res.status(500).send({ error: 'ERR_SRV' });
        }

        return res.status(200).send();
      });
    });
  });
};
