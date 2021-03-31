const log = require('../../../utils/logger.util')({ name: 'updateSource.controller' });
const { getUserById } = require('../../user/user.utils');
const paymentUtils = require('../payment.utils');

module.exports = async function updateSource(req, res) {
  const { userId } = req.params;
  const { stripeToken } = req.body;

  if (!stripeToken) {
    return res.status(400).send({
      error: 'ERR_NO_TOKEN',
      message: 'Card token is missing',
    });
  }

  if (String(req.user._id) !== userId) {
    return res.status(401).send({
      error: 'ERR_NOT_AUTHORIZED',
      message: 'You are not authorized to perform this action',
    });
  }

  try {
    const customer = await paymentUtils.getCustomerByUserId(req.user._id);
    await paymentUtils.updateCustomer(customer.id, {
      source: stripeToken,
    });

    return res.status(200).send();
  } catch (err) {
    log.fatal({ err }, 'failed to update payment source');
    return res.status(500).send();
  }
};
