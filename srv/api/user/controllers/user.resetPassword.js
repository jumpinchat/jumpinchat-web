const Joi = require('joi');
const bcrypt = require('bcrypt');
const log = require('../../../utils/logger.util')({ name: 'user.resetPasswordVerify' });
const VerifyModel = require('../../verify/verify.model');
const userUtils = require('../user.utils');

const getUser = (userId, cb) => {
  userUtils.getUserById(userId, (err, user) => {
    if (err) {
      log.error('error getting user', err);
      return cb({ status: 401, message: 'Unauthorized' });
    }

    if (!user) {
      log.error('user missing');
      return cb({ status: 401, message: 'Unauthorized' });
    }

    return cb(null, user);
  });
};

const generatePassHash = (password, cb) => bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    log.fatal(err);
    return cb({ status: 403, message: 'Forbidden' });
  }

  return bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      log.fatal(err);
      return cb({ status: 403, message: 'Forbidden' });
    }

    return cb(null, hash);
  });
});

module.exports = function resetPassword(req, res) {
  const schema = Joi.object().keys({
    password: Joi.string().min(6).required(),
    userId: Joi.string().required(),
  });

  Joi.validate(req.body, schema, (err, validated) => {
    if (err) {
      log.warn('invalid email verification token');
      res.status(400).send({ error: 'ERR_NO_DATA', message: 'required parameters are missing' });
      return;
    }

    getUser(validated.userId, (err, user) => {
      if (err) {
        return res.status(err.status).send(err.message);
      }

      generatePassHash(validated.password, (err, hash) => {
        if (err) {
          return res.status(err.status).send(err.message);
        }

        user.auth.passhash = hash;
        user.save((err) => {
          if (err) {
            log.fatal({ err }, 'Failed to save user');
            return res.status(403).send('Forbidden');
          }

          res.status(200).send();
        });
      });
    });
  });
};
