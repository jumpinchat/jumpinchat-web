const stripe = require('stripe');
const log = require('../../../utils/logger.util')({ name: 'getSubscription.controller' });
const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');
const {
  getPaymentByUserId,
  getCustomerByUserId,
} = require('../payment.utils');

const stripeClient = stripe(config.payment.stripe.secretKey);

module.exports = async function getSubscription(req, res) {
  const { userId } = req.params;

  if (String(req.user._id) !== userId) {
    return res.status(403).send();
  }

  let payment;
  let customer;
  let plan;
  let card;
  try {
    payment = await getPaymentByUserId(userId);
  } catch (err) {
    log.fatal({ err, userId }, 'failed to get payment');
    return res.status(500).send(errors.ERR_SRV);
  }

  log.debug({ payment }, 'got payment');

  if (!payment || !payment.customerId) {
    return res.status(404).send();
  }

  try {
    customer = await getCustomerByUserId(userId);
  } catch (err) {
    log.fatal({ err, userId }, 'failed to get customer');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (!customer) {
    return res.status(404).send();
  }

  try {
    if (customer.sources && customer.sources.data.length > 0) {
      const [source] = customer.sources.data;
      ({ card } = source);
    } else if (customer.subscriptions.data.length > 0) {
      const [subscriptionData] = customer.subscriptions.data;
      if (subscriptionData) {
        const paymentMethodId = customer.subscriptions.data[0].default_payment_method;
        const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
        ({ card } = paymentMethod);
      }
    }

    log.debug({ card });
  } catch (err) {
    log.fatal({ err, userId, customerId: customer.id }, 'failed to get payment method');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (!card) {
    log.error('payment method not found');
    return res.status(404).send();
  }

  try {
    plan = await stripeClient.plans.retrieve(payment.subscription.planId);

    if (!plan) {
      return res.status(404).send();
    }

    return res.status(200).send({
      paymentId: payment._id,
      plan: {
        id: plan.id,
        name: plan.nickname,
        amount: plan.amount,
        created: payment.createdAt,
        interval: plan.interval,
      },
      source: {
        last4: card.last4,
        expiry: {
          month: card.exp_month,
          year: card.exp_year,
        },
        brand: card.brand,
      },
    });
  } catch (err) {
    log.fatal({ err }, 'error fetching payment');
    return res.status(500).send(errors.ERR_SRV);
  }
};
