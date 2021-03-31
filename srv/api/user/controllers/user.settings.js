const log = require('../../../utils/logger.util')({ name: 'user.settings' });
const Joi = require('joi');
const userUtils = require('../user.utils');

module.exports = function settings(req, res) {
  const schema = Joi.object().keys({
    playYtVideos: Joi.boolean().default(false),
    allowPrivateMessages: Joi.boolean().default(false),
    pushNotificationsEnabled: Joi.boolean().default(false),
    receiveUpdates: Joi.boolean().default(false),
    receiveMessageNotifications: Joi.boolean().default(false),
    darkTheme: Joi.boolean().default(false),
  });

  Joi.validate(req.body, schema, (err, validated) => {
    if (err) {
      log.warn('settings body invalid', err);
      return res.status(400).send({
        error: 'ERR_INVALID_BODY',
        message: 'Settings are invalid',
      });
    }

    userUtils.getUserById(req.params.id, (err, user) => {
      if (err) {
        log.fatal({ err }, 'error getting user');
        return res.status(403).send({ error: 'ERR_SRV', message: 'Server error' });
      }

      if (!user) {
        log.warn('Could not find user');
        return res.status(404).send({ error: 'ERR_NO_USER', message: 'Could not find user' });
      }

      user.settings = {
        ...user.settings,
        ...validated,
      };

      user.save((err) => {
        if (err) {
          log.fatal({ err }, 'error saving user');
          return res.status(500).send({ error: 'ERR_SRV', message: 'Server error' });
        }

        log.debug('saved user settings');
        return res.status(200).send();
      });
    });
  });
};
