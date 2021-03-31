const log = require('../../../utils/logger.util')({ name: 'getVerificationRequests' });
const { findById } = require('../ageVerification.utils');

module.exports = async function getVerificationRequest(req, res) {
  const { id } = req.params;
  try {
    const request = await findById(id);
    res.status(200).send(request);
  } catch (err) {
    log.fatal({ err, id }, 'error fetching request');
    res.status(500).send();
  }
};
