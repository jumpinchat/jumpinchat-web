const { authenticator } = require('otplib');
const { getUserById } = require('../user.utils');
const OtpRequestModel = require('../otpRequest.model');
const { NotFoundError, ValidationError } = require('../../../utils/error.util');
const log = require('../../../utils/logger.util')({ name: 'mfaConfirmEnroll' });

module.exports = async function mfaConfirmEnroll(body) {
  const {
    userId,
    token,
  } = body;

  let user;

  try {
    user = await getUserById(userId, { lean: false });
  } catch (err) {
    throw err;
  }

  if (!user) {
    throw new NotFoundError('User not found');
  }

  let otpRequest;
  try {
    otpRequest = await OtpRequestModel.findOne({ userId }).exec();
  } catch (err) {
    throw err;
  }

  if (!otpRequest) {
    throw new NotFoundError('TOTP enrollment request not found');
  }

  let isValid;
  try {
    isValid = authenticator.verify({ token, secret: otpRequest.secret });
  } catch (err) {
    throw err;
  }

  log.debug({ isValid }, 'is otp request verify valid');

  if (isValid) {
    try {
      await OtpRequestModel.deleteMany({ userId }).exec();
    } catch (err) {
      throw err;
    }

    user.auth.totpSecret = otpRequest.secret;
    try {
      await user.save();
    } catch (err) {
      throw err;
    }

    return isValid;
  }

  throw new ValidationError('Invalid token');
};
