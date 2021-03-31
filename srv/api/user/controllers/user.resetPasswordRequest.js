const Joi = require('joi');
const log = require('../../../utils/logger.util')({ name: 'user.resetPasswordRequest' });
const { createPasswordReset } = require('../../verify/verify.utils');
const userUtils = require('../user.utils');

const getUser = (username, cb) => {
  userUtils.getUserByName(username, (err, user) => {
    if (err) {
      log.fatal({ err, username }, 'error getting user');
      return cb({
        status: 500,
        message: 'An error occurred while creating a password reset request',
      });
    }

    if (!user) {
      log.warn('attempted to reset password of non-existing user');
      return cb();
    }

    return cb(null, user);
  });
};


module.exports = function requestResetPassword(req, res) {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().required(),
  });

  return Joi.validate(req.body, schema, (err, validated) => {
    if (err) {
      log.warn('invalid email verification token');
      return res.status(400).send('Email address is required');
    }

    return getUser(validated.username, (err, user) => {
      if (err) {
        return res.status(err.status).send(err.message);
      }

      if (!user) {
        return res.status(204).send();
      }

      if (!user.auth.email_is_verified) {
        return res.status(204).send();
      }

      return createPasswordReset(user, (err) => {
        if (err) {
          log.error({ err }, 'Could not create new verification data');
          return res.status(403).send();
        }

        return res.status(204).send();
      });
    });
  });
};
