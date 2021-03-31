const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const config = require('../../../config/env');
const log = require('../../../utils/logger.util')({ name: 'room.submitRoomPassword' });
const roomUtils = require('../room.utils');

module.exports = async function submitRoomPassword(req, res) {
  const schema = Joi.object().keys({
    password: Joi.string().required(),
  });

  try {
    const { value: { password } } = Joi.validate(req.body, schema);
    return roomUtils.getRoomByName(req.params.room, async (err, room) => {
      if (err) {
        log.fatal({ err }, 'error getting room');
        return res.status(500).send({ error: 'ERR_SRV' });
      }

      if (!room) {
        log.warn({ roomName: room.name }, 'room not found');
        return res.status(404).send({ error: 'ERR_NO_ROOM' });
      }

      try {
        const match = await bcrypt.compare(password, room.settings.passhash);
        if (!match) {
          return res.status(401).send({
            error: 'ERR_PASSWORD',
            message: 'Password incorrect',
          });
        }

        const token = jwt.sign({ room: room.name }, config.auth.jwt_secret);

        res.cookie(`jic.password.${room.name}`, token, {
          maxAge: 1000 * 60 * 5,
        });

        return res.status(200).send();
      } catch (pwErr) {
        log.error({ err: pwErr }, 'error comparing room password');
        return res.status(500).send('ERR_SRV');
      }
    });
  } catch (err) {
    log.warn({ err }, 'invalid room name');
    return res.status(400)
      .send({ error: 'ERR_VALIDATION', message: 'Invalid room ID' });
  }
};
