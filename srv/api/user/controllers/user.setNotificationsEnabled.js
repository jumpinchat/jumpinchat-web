const log = require('../../../utils/logger.util')({ name: 'user.settings' });
const Joi = require('joi');
const userUtils = require('../user.utils');

module.exports = function setNotificationsEnabled(req, res) {
  const schema = Joi.object().keys({
    enabled: Joi.boolean(),
  });

  Joi.validate(req.body, schema, (err, validated) => {
    if (err) {
      log.warn('settings body invalid', err);
      return res.status(400)
        .send({
          error: 'ERR_INVALID_BODY',
          message: 'Invalid body',
        });
    }

    userUtils.getUserById(req.params.userId, (err, user) => {
      if (err) {
        log.fatal({ err }, 'error getting user');
        return res.status(403).send({ error: 'ERR_SRV', message: 'Server error' });
      }

      if (!user) {
        log.warn('Could not find user');
        return res.status(404).send({ error: 'ERR_NO_USER', message: 'Could not find user' });
      }

      user.settings.pushNotificationsEnabled = validated.enabled;

      return user.save((err) => {
        if (err) {
          log.fatal({ err }, 'error saving user');
          return res.status(500).send({ error: 'ERR_SRV', message: 'Server error' });
        }

        return res.status(200).send();
      });
    });
  });
};
