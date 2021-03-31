const log = require('../../../utils/logger.util')({ name: 'user.resetPasswordVerify' });
const Joi = require('joi');
const VerifyModel = require('../../verify/verify.model');
const { types: verifyTypes } = require('../../verify/verify.constants');

module.exports = function resetPasswordVerify(req, res) {
  const schema = Joi.object().keys({
    token: Joi.string().required(),
  });

  Joi.validate(req.params, schema, (err, validated) => {
    if (err) {
      log.warn('invalid email verification token');
      res.status(400).send({ error: 'ERR_TOKEN_INVALID', message: 'A valid token is required' });
      return;
    }

    log.debug({ token: validated.token }, 'verifying reset token');


    VerifyModel
      .findOne({ token: validated.token, type: verifyTypes.TYPE_PASS_RESET })
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

        res.status(200).send({ userId: v.userId });
      });
  });
};
