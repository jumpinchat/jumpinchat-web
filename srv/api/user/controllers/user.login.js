/**
 * Created by Zaccary on 24/10/2015.
 */

const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger.util')({ name: 'user.login' });

const userUtils = require('../user.utils');
const config = require('../../../config/env');
const ReturnModel = require('../../../lib/return-model');
const { getRemoteIpFromReq } = require('../../../utils/utils');

module.exports = function login(req, res) {
  const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  Joi.validate({
    username: req.body.username,
    password: req.body.password,
  }, schema, { abortEarly: false }, (err, validatedLogin) => {
    if (err) {
      log.warn('invalid login details');
      return res.status(400).send(new ReturnModel(err, null, 'ERR_VALIDATION'));
    }

    userUtils.getUserByName(validatedLogin.username.toLowerCase(), (err, user) => {
      if (err) {
        log.fatal({ err }, 'error getting user by username');
        return res.status(500).send(new ReturnModel(null, null, 'ERR_SRV'));
      }

      if (!user) {
        log.warn('username not found during login');
        return res.status(401).send(new ReturnModel(null, null, 'ERR_NO_USER'));
      }

      bcrypt.compare(validatedLogin.password, user.auth.passhash, (err, doesMatch) => {
        if (err) {
          log.fatal({ err }, 'error comparing passhash');
          return res.status(401).send('forbidden');
        }

        if (!doesMatch) {
          log.warn('user entered an incorrect password');
          return res.status(401).send(new ReturnModel(null, null, 'ERR_BAD_PASS'));
        }

        user.attrs.last_login_ip = getRemoteIpFromReq(req);
        user.attrs.last_active = new Date();

        // log user in
        const token = jwt.sign(String(user._id), config.auth.jwt_secret);
        user.save((err, savedUser) => {
          if (err) {
            log.fatal({ err }, 'error saving user');
            res.status(403).send('forbidden');
            return;
          }

          const dataToReturn = {
            user: savedUser,
            token,
          };

          // create cookie/cookies
          res.cookie('jic.ident', savedUser._id, {
            maxAge: 1000 * 60 * 60 * 24 * 180,
            signed: true,
            httpOnly: true,
          });

          res.status(200).send(new ReturnModel(null, dataToReturn, null));
        });
      });
    });
  });
};
