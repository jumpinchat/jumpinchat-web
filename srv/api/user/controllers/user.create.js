/**
 * Created by Zaccary on 24/10/2015.
 */

const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger.util')({ name: 'user.create' });
const userUtils = require('../user.utils');
const UserModel = require('../user.model');
const RoomUtils = require('../../room/room.utils');
const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');
const ReturnModel = require('../../../lib/return-model');
const roomCreate = require('../../room/controllers/room.create');
const sitebanUtils = require('../../siteban/siteban.utils');

const generatePassHash = (password, cb) => bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    log.fatal({ err }, 'failed to generate password');
    return cb(err);
  }

  return bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      log.fatal({ err }, 'failed to generate password');
      return cb(err);
    }

    return cb(null, hash);
  });
});

async function checkUserIsBanned({ username, email, fingerprint, ip }, sessionId) {
  let users;

  try {
    users = await userUtils.getUsersByEmail(email);
  } catch (err) {
    throw err;
  }

  // check if banlist contains properties associated
  // with previously banned users. Useful for when
  // an account was subsequently deleted
  if (!users.length) {
    const banlistItem = await sitebanUtils.getBanlistItem({
      sessionId,
      ip,
      fingerprint,
      username,
      email,
    });

    log.debug({ banlistItem }, 'banlist item');

    if (banlistItem) {
      return true;
    }

    return false;
  }

  const banlistPromises = users
    .map(user => sitebanUtils.getBanlistItem({
      sessionId: user.session_id,
      ip: user.last_login_ip,
      userId: user._id,
      username: user.username,
      fingerprint,
    }));

  try {
    const banlistItems = await Promise.all(banlistPromises);
    log.debug({ banlistItems }, 'banlist items');

    return banlistItems.some(b => b !== null && b !== undefined);
  } catch (err) {
    throw err;
  }
}

module.exports = async function createUser(req, res) {
  const sessionId = req.sessionID;
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    settings: Joi.object().keys({
      receiveUpdates: Joi.boolean().required(),
    }).required(),
    ip: Joi.string().required(),
    fingerprint: Joi.string().allow(''),
  });

  const user = {
    username: req.body.username.toLowerCase(),
    email: req.body.email,
    password: req.body.password,
    settings: req.body.settings,
    ip: req.body.ip,
    fingerprint: req.body.fingerprint,
  };

  try {
    const isUserBanned = await checkUserIsBanned(user, sessionId);
    if (isUserBanned) {
      return res
        .status(400)
        .send(errors.ERR_USER_BANNED);
    }
  } catch (err) {
    log.fatal({ err }, 'failed to check if user banned');
    return res.status(500).send(errors.ERR_SRV);
  }

  Joi.validate(user, schema, { abortEarly: false }, (err, validatedUser) => {
    if (err) {
      return res.status(400).send(new ReturnModel(err, null, 'ERR_INPUT_VALIDATION'));
    }

    let userObj;

    userUtils.getUserByName(validatedUser.username, (err, hasUser) => {
      if (err) {
        log.fatal({ err, username: validatedUser.username }, 'failed to get user');
        return res.status(500).send({
          error: err,
        });
      }

      if (hasUser) {
        return res.status(403).send(new ReturnModel(null, null, 'ERR_USER_EXISTS'));
      }

      generatePassHash(validatedUser.password, (err, hash) => {
        if (err) {
          return res.status(403).send({
            error: err,
          });
        }

        // Store hash in your password DB.
        userObj = {
          username: validatedUser.username,
          attrs: {
            join_ip: validatedUser.ip,
            last_login_ip: validatedUser.ip,
          },
          auth: {
            email: validatedUser.email,
            passhash: hash,
            joinFingerprint: validatedUser.fingerprint,
            latestFingerprint: validatedUser.fingerprint,
          },
          settings: validatedUser.settings,
        };

        UserModel.create(userObj, (err, createdUser) => {
          if (err) {
            log.fatal({ err }, 'failed to create user');
            return res.status(403).send({
              error: 'forbidden',
            });
          }

          // create room
          roomCreate({
            name: validatedUser.username,
            ip: validatedUser.ip,
            isUserRoom: true,
          }, createdUser, (err, room) => {
            if (err) {
              log.fatal({ err }, 'failed to create room');
              return res.status(403).send({
                error: 'forbidden',
              });
            }

            // log user in
            const token = jwt.sign({ id: createdUser._id }, config.auth.jwt_secret);

            // create cookie/cookies
            res.cookie('jic.ident', createdUser._id, {
              maxAge: config.auth.cookieTimeout,
              signed: true,
            });

            const result = {
              user: createdUser,
              room: RoomUtils.filterRoom(room),
              token,
            };

            res.status(201).send(new ReturnModel(null, result, null));
          });
        });
      });
    });
  });
};
