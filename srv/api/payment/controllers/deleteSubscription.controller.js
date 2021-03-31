const log = require('../../../utils/logger.util')({ name: 'deleteSubscription.controller' });
const errors = require('../../../config/constants/errors');
const { cancelSubscription } = require('../payment.utils');

module.exports = async function deleteSubscription(req, res) {
  const { userId } = req.params;

  if (String(req.user._id) !== userId) {
    return res.status(403).send();
  }

  try {
    await cancelSubscription(userId);

    return res.status(204).send();
  } catch (err) {
    log.fatal({ err }, 'error cancelling subscription');
    return res.status(500).send(errors.ERR_SRV);
  }
};
