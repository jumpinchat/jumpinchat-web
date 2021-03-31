const log = require('../../../utils/logger.util')({ name: 'admin.openNotification' });
const {
  isSubscriptionConfirmation,
  handleSnsSubscription,
} = require('../../email/email.utils');


module.exports = function openNotification(req, res) {
  if (isSubscriptionConfirmation(req.headers)) {
    return handleSnsSubscription(req, res);
  }

  try {
    const message = JSON.parse(req.body.Message);
    const { eventType } = message;

    log.info({ openNotification: message }, `email ${eventType}`);
    return res.status(204).send();
  } catch (err) {
    log.fatal({ err }, 'error parsing email open notification');
    return res.status(500).send(err);
  }
};
