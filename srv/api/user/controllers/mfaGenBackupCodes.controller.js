const OtpBackupCodeSchema = require('../otpBackupCode.model');

module.exports = async function mfaGenBackupCodes(body) {
  const { userId } = body;

  const codes = [];
  for (let i = 0; i < 12; i += 1) {
    const code = new Array(6)
      .fill()
      .map(() => (Math.random() * 16 | 0).toString(16))
      .join('');
    codes.push(code);
  }

  const codeDocs = codes.map(code => ({
    userId,
    code,
  }));

  await OtpBackupCodeSchema.deleteMany({ userId });
  await OtpBackupCodeSchema.insertMany(codeDocs);

  return { codes };
};
