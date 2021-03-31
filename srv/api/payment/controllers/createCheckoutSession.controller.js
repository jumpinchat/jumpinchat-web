const stripe = require('stripe');
const log = require('../../../utils/logger.util')({ name: 'createCheckoutSession.controller' });
const { getHostDomain } = require('../../../utils/utils');
const errors = require('../../../config/constants/errors');
const config = require('../../../config/env');
const {
  productIds,
  productTypes,
  products,
} = require('../payment.constants');
const { getUserById } = require('../../user/user.utils');
const paymentUtils = require('../payment.utils');

module.exports = async function createCheckoutSession(req, res) {
  const { product, amount, beneficiary } = req.body;
  const stripeClient = stripe(config.payment.stripe.secretKey);
  const domain = getHostDomain(req);
  const successUrl = `${domain}/support/payment/success?amount=${amount / 100}`;
  const cancelUrl = `${domain}/support`;

  let user;
  let userEmail;
  let existingPayment;
  let customer;

  if (!product) {
    return res.status(400).send({
      error: 'ERR_NO_PRODUCT',
      message: 'Product is missing',
    });
  }

  if (amount && amount < 300) {
    return res.status(400).send({
      error: 'ERR_INVALID_AMOUNT',
      message: 'Minimum amount is $3.00',
    });
  }

  if (amount && amount > 5000) {
    return res.status(400).send({
      error: 'ERR_INVALID_AMOUNT',
      message: 'Maximum amount is $50.00',
    });
  }

  if (product === productIds.SUPPORT_ONE_TIME && !amount) {
    return res.status(400).send({
      error: 'ERR_NO_AMOUNT',
      message: 'An amount is required for a one-time payment',
    });
  }

  const productDetail = products[product];
  try {
    existingPayment = await paymentUtils.getPaymentByUserId(req.user._id);
  } catch (err) {
    log.fatal({ err }, 'failed to fetch payment');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (existingPayment && existingPayment.customerId) {
    customer = existingPayment.customerId;
  }

  try {
    user = await getUserById(req.user._id, { lean: false });
  } catch (err) {
    log.fatal({ err }, 'failed to get user');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (!user) {
    log.error({ userId: req.user._id }, 'no user');
    return res.status(500).send(errors.ERR_NO_USER);
  }

  if (user.auth.email_is_verified) {
    userEmail = user.auth.email;
  }

  if (productDetail.type === productTypes.TYPE_PLAN) {
    if (existingPayment && user.attrs.isGold) {
      return res.status(422).send({
        error: 'ERR_SUBSCRIPTION_EXISTS',
        message: 'You are already subscribed, check your account settings for more information',
      });
    }

    try {
      const sessionOpts = {
        payment_method_types: ['card'],
        subscription_data: {
          items: [{
            plan: productDetail.id,
          }],
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      if (customer) {
        sessionOpts.customer = customer;
      }

      const session = await stripeClient.checkout.sessions.create(sessionOpts);

      try {
        await paymentUtils.saveCheckoutSession(user._id, session.id);
        return res.status(201).send(session.id);
      } catch (err) {
        log.fatal({ err }, 'failed to save checkout session');
        return res.status(500).send(errors.ERR_SRV);
      }
    } catch (err) {
      log.fatal({ err }, 'failed to create checkout client');
      return res.status(500).send(errors.ERR_SRV);
    }
  }

  if (productDetail.type === productTypes.TYPE_CHARGE) {
    const sessionOpts = {
      payment_method_types: ['card'],
      line_items: [{
        name: 'Site Supporter',
        description: `One-off supporter payment of $${amount / 100}`,
        amount,
        currency: 'usd',
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (customer) {
      sessionOpts.customer = customer;
    }

    try {
      const session = await stripeClient.checkout.sessions.create(sessionOpts);

      try {
        log.debug({ userId: user._id, beneficiary }, 'creating new session');
        await paymentUtils.saveCheckoutSession(user._id, session.id, beneficiary);
        return res.status(201).send(session.id);
      } catch (err) {
        log.fatal({ err }, 'failed to save checkout session');
        return res.status(500).send(errors.ERR_SRV);
      }
    } catch (err) {
      log.fatal({ err }, 'failed to create checkout client');
      return res.status(500).send(errors.ERR_SRV);
    }
  }
};
