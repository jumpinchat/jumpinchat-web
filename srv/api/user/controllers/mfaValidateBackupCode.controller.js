const OtpBackupCodeSchema = require('../otpBackupCode.model');
const { ValidationError } = require('../../../utils/error.util');

module.exports = async function mfaGenBackupCodes(body) {
  const { userId, code } = body;
  const codeDoc = await OtpBackupCodeSchema.findOne({
    userId,
    code,
  }).exec();


  if (codeDoc) {
    await OtpBackupCodeSchema.deleteOne({ _id: codeDoc._id }).exec();
    return true;
  }

  throw new ValidationError('Invalid code');
};
