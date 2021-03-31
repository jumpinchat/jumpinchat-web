const log = require('../../../utils/logger.util')({ name: 'mfaGenBackupCodes' });
const mfaGenBackupCodes = require('../controllers/mfaGenBackupCodes.controller');

module.exports = async function mfaGenBackupCodesConnector(req, res) {
  const {
    user,
  } = req;

  try {
    const response = await mfaGenBackupCodes({ userId: user._id });
    return res.status(200).send(response);
  } catch (err) {
    log.fatal({ err }, 'failed to generate backup codes');
    return res.status(500).send();
  }
};
