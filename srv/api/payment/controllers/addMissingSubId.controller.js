const stripe = require('stripe');
const log = require('../../../utils/logger.util')({ name: 'migrate trophies' });
const paymentModel = require('../payment.model');
const config = require('../../../config/env');

const stripeClient = stripe(config.payment.stripe.secretKey);

module.exports = async function addMissingSubId(req, res) {
  let payments;

  try {
    payments = await paymentModel.find({
      $and: [
        { 'subscription.planId': { $ne: null } },
        { 'subscription.id': null },
      ],
    }).exec();
  } catch (err) {
    return res.status(500).send(err);
  }

  payments.forEach(async (payment) => {
    const { customerId } = payment;
    const response = await stripeClient.subscriptions.list({ customer: customerId })

    if (response) {
      const { data } = response;
      const [subscription] = data;
      payment.subscription.id = subscription.id;

      try {
        await payment.save();
      } catch (err) {
        log.fatal({ err });
      }
    }
  });

  return res.status(200).send();
};
