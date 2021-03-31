const Joi = require('joi');
const config = require('../../../config/env');
const log = require('../../../utils/logger.util')({ name: 'userCreateSession' });
const userUtils = require('../user.utils');


module.exports = function checkUsername(req, res) {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().required(),
  });

  Joi.validate(req.params, schema, { abortEarly: false }, (err, params) => {
    if (err) {
      log.warn('invalid username');
      return res.status(400).send({
        message: 'Username can only contain letters and numbers',
        error: 'ERR_VALIDATION',
      });
    }

    const username = params.username.toLowerCase();

    if (username.length > 16) {
      return res.status(400)
        .send({
          message: 'Username can not be longer than 16 characters',
          error: 'ERR_VALIDATION',
        });
    }

    if (config.reservedUsernames.includes(username)) {
      return res.status(400)
        .send({
          message: 'Username taken',
          error: 'ERR_USER_EXISTS',
        });
    }

    return userUtils.getUserByName(username, (err, hasUser) => {
      if (err) {
        log.error({ err });
        return res.status(403).send({
          error: 'forbidden',
        });
      }

      if (hasUser) {
        return res.status(400).send({ message: 'Username taken', error: 'ERR_USER_EXISTS' });
      }

      return res.status(200).send();
    });
  });
};
