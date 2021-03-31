const Joi = require('joi');
const bcrypt = require('bcrypt');
const log = require('../../../utils/logger.util')({ name: 'user.changeEmail' });
const userUtils = require('../user.utils');
const { createEmailVerification } = require('../../verify/verify.utils');

module.exports = function changeEmail(req, res) {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return Joi.validate(req.body, schema, (err, validated) => {
    if (err) {
      log.warn({ err }, 'body invalid');
      return res.status(400).send({ error: 'ERR_INVALID_BODY', message: 'Invalid body' });
    }

    return userUtils.getUserById(req.params.userId, (err, user) => {
      if (err) {
        log.fatal({ err }, 'error getting user');
        return res.status(403).send({ error: 'ERR_SRV', message: 'Server error' });
      }

      if (!user) {
        log.warn('Could not find user');
        res
          .status(404)
          .send({ error: 'ERR_NO_USER', message: 'Could not find user' });
        return;
      }

      if (user.auth.email === validated.email) {
        return res.status(200).send();
      }


      return bcrypt.compare(validated.password, user.auth.passhash, (err, doesMatch) => {
        if (err) {
          log.fatal({ err }, 'error comparing passhash');
          return res.status(401).send('forbidden');
        }

        if (!doesMatch) {
          log.warn('user entered an incorrect password');
          return res.status(401).send({
            error: 'ERR_BAD_PASS',
            message: 'password invalid',
          });
        }

        user.auth.email = validated.email;
        user.auth.email_is_verified = false;

        return user.save((err) => {
          if (err) {
            log.fatal({ err }, 'error saving user');
            return res.status(500).send({ error: 'ERR_SRV', message: 'Server error' });
          }

          return createEmailVerification(user, (err) => {
            if (err) {
              log.fatal({ err }, 'failed to send verification email');
            }

            return res.status(200).send();
          });
        });
      });
    });
  });
};
