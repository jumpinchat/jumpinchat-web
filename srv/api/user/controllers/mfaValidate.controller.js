const { authenticator } = require('otplib');
const { getUserById } = require('../user.utils');
const OtpBackupCodeSchema = require('../otpBackupCode.model');
const { NotFoundError, ValidationError } = require('../../../utils/error.util');
const log = require('../../../utils/logger.util')({ name: 'mfaValidate' });

module.exports = async function mfaValidate(body) {
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

  const {
    auth: { totpSecret: secret },
  } = user;

  let isValid;
  try {
    isValid = authenticator.verify({ token, secret });
  } catch (err) {
    throw err;
  }

  if (!isValid) {
    const backupCode = await OtpBackupCodeSchema.findOne({
      code: token.toLowerCase(),
      userId,
    }).exec();

    if (backupCode) {
      await OtpBackupCodeSchema.deleteOne({ _id: backupCode._id }).exec();
      log.debug('backup code used');
      isValid = true;
    }
  }

  if (!isValid) {
    throw new ValidationError('Invalid token');
  }

  return isValid;
};
