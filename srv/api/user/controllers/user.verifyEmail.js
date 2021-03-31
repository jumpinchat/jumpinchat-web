const log = require('../../../utils/logger.util')({ name: 'user.verifyEmail' });
const Joi = require('joi');
const VerifyModel = require('../../verify/verify.model');
const trophyUtils = require('../../trophy/trophy.utils');
const UserUtils = require('../user.utils');
const { types: verifyTypes } = require('../../verify/verify.constants');

module.exports = function verifyEmail(req, res) {
  const schema = Joi.object().keys({
    token: Joi.string().required(),
  });

  Joi.validate(req.params, schema, (err, validated) => {
    if (err) {
      log.warn('invalid email verification token');
      res.status(400).send({ error: 'ERR_TOKEN_INVALID', message: 'A valid token is required' });
      return;
    }


    VerifyModel
      .findOne({ token: validated.token, type: verifyTypes.TYPE_EMAIL })
      .where({ expireDate: { $gt: new Date() } })
      .exec((err, v) => {
        if (err) {
          log.fatal(err);
          res.status(403).send();
          return;
        }

        if (!v) {
          log.warn('verification token not found');
          res.status(403).send({
            error: 'ERR_NO_TOKEN',
            message: 'Token is invalid or has expired',
          });
          return;
        }

        UserUtils.getUserById(v.userId, (err, user) => {
          if (err) {
            log.fatal('could not get user', v.userId, err);
            res.status(403).send();
            return;
          }

          if (!user) {
            log.error('user does not exists', v.userId);
            res.status(401).send();
            return;
          }

          user.auth.email_is_verified = true;
          user.save((err) => {
            if (err) {
              log.fatal('error saving user', user._id, err);
              res.status(403).send();
              return;
            }

            trophyUtils.applyTrophy(user._id, 'TROPHY_EMAIL_VERIFIED', (err) => {
              if (err) {
                log.error({ err }, 'failed to apply trophy');
              }

              log.debug('applied trophy');
            });

            res.status(200).send();
          });
        });
      });
  });
};
