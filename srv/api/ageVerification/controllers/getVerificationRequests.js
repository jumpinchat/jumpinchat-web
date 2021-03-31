const log = require('../../../utils/logger.util')({ name: 'getVerificationRequests' });
const { getRequests } = require('../ageVerification.utils');

module.exports = async function getVerificationRequests(req, res) {
  try {
    const requests = await getRequests();
    return res.status(200).send(requests);
  } catch (err) {
    log.fatal({ err }, 'error fetching requests');
    return res.status(500).send();
  }
};
