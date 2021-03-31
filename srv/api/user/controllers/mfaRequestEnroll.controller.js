const qrcode = require('qrcode');
const { authenticator } = require('otplib');
const { getUserById } = require('../user.utils');
const OtpRequestModel = require('../otpRequest.model');
const { NotFoundError } = require('../../../utils/error.util');

module.exports = async function mfaRequestEnroll(body) {
  const {
    userId,
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

  let secret;
  const otpRequest = await OtpRequestModel.findOne({ userId }).exec();

  if (otpRequest) {
    ({ secret } = otpRequest);
  } else {
    secret = authenticator.generateSecret();
  }

  let qrUrl;
  const otpUri = authenticator.keyuri(user.username, 'JumpInChat', secret);

  try {
    qrUrl = await qrcode.toDataURL(otpUri);
  } catch (err) {
    throw err;
  }

  if (!otpRequest) {
    await OtpRequestModel.create({
      secret,
      userId,
    });
  }

  return {
    qrUrl,
  };
};
