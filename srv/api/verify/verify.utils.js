const uuid = require('uuid');
const crypto = require('crypto');
const log = require('../../utils/logger.util')({ name: 'verify.utils' });
const config = require('../../config/env');
const VerifyModel = require('./verify.model');
const email = require('../../config/email.config');
const {
  signUpTemplate,
  resetPasswordTemplate,
} = require('../../config/constants/emailTemplates');

const types = {
  TYPE_EMAIL: 'email',
  TYPE_PASS_RESET: 'passwordreset',
};

module.exports.createEmailVerification = function createEmailVerification(user, cb = () => {}) {
  VerifyModel.findOneAndRemove({ userId: user._id, type: types.TYPE_EMAIL }, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to create verification entry');
      return cb(err);
    }

    const token = crypto.createHash('sha256').update(uuid.v4()).digest('hex');

    VerifyModel.create({
      userId: user._id,
      expireDate: new Date(Date.now() + config.verification.emailTimeout),
      token,
      type: types.TYPE_EMAIL,
    }, (err, verifyEntry) => {
      if (err) {
        log.fatal({ err }, 'failed to create verification entry');
        return cb(err);
      }

      email.sendMail({
        to: user.auth.email,
        subject: 'Activate your JumpInChat account',
        html: signUpTemplate({ username: user.username, token: verifyEntry.token }),
      }, cb);
    });
  });
};

module.exports.createPasswordReset = function createPasswordReset(user, cb = () => {}) {
  if (!user.auth.email_is_verified) {
    log.warn('User attempted to reset a password with an unverified email', user._id);
    return cb();
  }

  VerifyModel.findOneAndRemove({ userId: user._id, type: types.TYPE_PASS_RESET }, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to create verification entry');
      return cb(err);
    }

    const token = crypto.createHash('sha256').update(uuid.v4()).digest('hex');

    VerifyModel.create({
      userId: user._id,
      expireDate: new Date(Date.now() + config.verification.pwResetTimeout),
      token,
      type: types.TYPE_PASS_RESET,
    }, (err, verifyEntry) => {
      if (err) {
        log.fatal({ err }, 'failed to create verification entry');
        return cb(err);
      }

      log.debug('sending password reset email');

      email.sendMail({
        to: user.auth.email,
        subject: 'Password reset',
        html: resetPasswordTemplate({ username: user.username, token: verifyEntry.token }),
      }, cb);
    });
  });
};
