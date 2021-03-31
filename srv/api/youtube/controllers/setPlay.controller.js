const log = require('../../../utils/logger.util')({ name: 'setPlay.controller' });
const Joi = require('joi');
const { getUserById } = require('../../user/user.utils');

module.exports = function (req, res) {
  const userId = req.signedCookies['jic.ident'];

  if (!userId) {
    return res.status(200).send();
  }

  const schema = Joi.object().keys({
    play: Joi.boolean().required(),
  });

  Joi.validate(req.query, schema, (err) => {
    if (err) {
      res.status(400).send({
        error: 'ERR_VALIDATION',
        message: 'required query `play` must be a boolean value',
      });
    }

    return getUserById(userId, { lean: false }, (err, user) => {
      if (err) {
        log.fatal({ err }, 'error getting user');
        return res.status(500).send({ error: 'an error occurred' });
      }

      if (!user) {
        log.error({ userId }, 'User could not be found');
        return res.status(401).send({ error: 'User could not be found' });
      }

      user.settings.playYtVideos = req.query.play;

      return user.save((err, savedUser) => {
        if (err) {
          log.fatal({ err }, 'error saving user');
          return res.status(500).send({ error: 'an error occurred' });
        }

        return res.status(200).send({ playVideos: savedUser.settings.playYtVideos });
      });
    });
  });
};
