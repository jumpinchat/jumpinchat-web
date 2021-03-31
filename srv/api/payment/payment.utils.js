const request = require('request');
const stripe = require('stripe');
const config = require('../../config/env');
const errors = require('../../config/constants/errors');
const trophyUtils = require('../trophy/trophy.utils');
const { getUserById } = require('../user/user.utils');
const log = require('../../utils/logger.util')({ name: 'payment.utils' });
const paymentModel = require('./payment.model');
const CheckoutSession = require('./checkoutSession.model');

const stripeClient = stripe(config.payment.stripe.secretKey);

module.exports.savePayment = function savePayment(userId, customerId, subscriptionId, planId) {
  const payment = {
    userId,
    customerId,
    subscription: {
      id: subscriptionId,
      planId,
    },
  };

  return paymentModel.create(payment);
};

function saveCheckoutSession(userId, checkoutSessionId, beneficiary) {
  const session = {
    userId,
    checkoutSessionId,
    beneficiary,
  };

  return CheckoutSession.create(session);
}

module.exports.saveCheckoutSession = saveCheckoutSession;

function getPaymentByUserId(userId, opts = {}) {
  const {
    isSubscription = false,
  } = opts;

  let query = { userId };

  if (isSubscription) {
    query = {
      ...query,
      'subscription.id': {
        $ne: null,
      },
    };
  }

  return paymentModel.findOne(query).exec();
}

module.exports.getPaymentByUserId = getPaymentByUserId;

module.exports.getPaymentByCustomerId = function getPaymentByCustomerId(customerId) {
  return paymentModel.findOne({
    customerId,
  })
    .exec();
};

module.exports.getSessionById = function getSessionById(checkoutSessionId) {
  return CheckoutSession
    .findOne({
      checkoutSessionId,
    })
    .populate({
      path: 'beneficiary',
      select: ['username'],
    })
    .populate({
      path: 'userId',
      select: ['username'],
    })
    .exec();
};

module.exports.getCustomerByUserId = async function getCustomerByUserId(userId) {
  try {
    const payment = await paymentModel.findOne({ userId }).exec();
    const { customerId } = payment;

    if (!customerId) {
      return Promise.reject(new Error('NoCustomerError'));
    }

    return stripeClient.customers.retrieve(customerId);
  } catch (err) {
    log.fatal({ err }, 'failed to getch customer');
    return Promise.reject(err);
  }
};

async function deletePayment(id) {
  try {
    const payment = await paymentModel.findOne({ _id: id }).exec();

    const user = await getUserById(payment.userId, { lean: false });
    user.attrs.isGold = false;
    await user.save();
  } catch (err) {
    log.fatal({ err }, 'failed to remove payment');
    throw err;
  }

  return paymentModel.deleteOne({ _id: id }).exec();
}

module.exports.deletePayment = deletePayment;

module.exports.cancelSubscription = async function cancelSubscription(userId) {
  const payment = await getPaymentByUserId(userId, { isSubscription: true });

  if (!payment) {
    const error = new Error();
    error.name = 'NotFoundError';
    error.message = 'Payment not found';
    throw error;
  }

  await stripeClient.subscriptions.del(payment.subscription.id);
  await deletePayment(payment.id);

  log.info({ payment }, 'subscription cancelled');

  return true;
};

module.exports.updateExpire = async function updateExpire(id, userId) {
  try {
    const user = await getUserById(userId, { lean: false });
    const supportDuration = (1000 * 60 * 60 * 24 * 31);
    user.attrs.supportExpires = new Date(Date.now() + supportDuration);
    await user.save();
  } catch (err) {
    log.fatal({ err }, 'failed to remove payment');
    throw err;
  }
};

module.exports.notifySlack = function notifySlack(user, plan) {
  const slackHookUrl = 'https://hooks.slack.com/services/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';
  const text = 'New site supporter';
  const payload = {
    username: 'Supporter bot',
    channel: '#general',
    icon_url: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-site-supporter.jpg',
    attachments: [
      {
        pretext: text,
        fallback: text,
        fields: [
          {
            title: user.username,
            value: plan.nickname,
          },
        ],
      },
    ],
  };

  const requestOptions = {
    method: 'POST',
    url: slackHookUrl,
    body: payload,
    json: true,
  };

  return new Promise((resolve, reject) => request(requestOptions, (err, response) => {
    if (err) {
      log.fatal({ err }, 'error posting slack webhook');
      return reject(err);
    }

    if (response.statusCode >= 400) {
      log.fatal({ statusCode: response.statusCode }, 'error posting slack webhook');
      return reject(response.statusCode);
    }

    return resolve();
  }));
};


module.exports.createCharge = function createCharge(amount, token, userId) {
  return stripeClient.paymentIntents.create({
    amount,
    currency: 'usd',
    description: 'JumpInChat one-time site support',
    source: token,
    metadata: {
      userId,
    },
  });
};

module.exports.applySupporterTrophy = function applySupporterTrophy(userId, isGold = false) {
  trophyUtils.applyTrophy(userId, 'TROPHY_SITE_SUPPORTER', (err) => {
    if (err) {
      log.fatal({ err }, 'failed to apply trophy');
      return;
    }

    log.debug('applied trophy');
  });

  if (isGold) {
    trophyUtils.applyTrophy(userId, 'TROPHY_SITE_SUPPORTER_GOLD', (err) => {
      if (err) {
        log.fatal({ err }, 'failed to apply trophy');
        return;
      }

      log.debug('applied trophy');
    });
  }
};

module.exports.applyGiftTrophies = function applyGiftTrophies(senderId, recipientId) {
  trophyUtils.applyTrophy(senderId, 'TROPHY_DID_GIFT', (err) => {
    if (err) {
      log.fatal({ err }, 'failed to apply trophy');
      return;
    }

    log.debug({ trophy: 'TROPHY_DID_GIFT', userId: senderId }, 'applied trophy');
  });

  trophyUtils.applyTrophy(recipientId, 'TROPHY_GIFTED', (err) => {
    if (err) {
      log.fatal({ err }, 'failed to apply trophy');
      return;
    }

    log.debug({ trophy: 'TROPHY_GIFTED', userId: recipientId }, 'applied trophy');
  });
};

module.exports.createCustomer = async function createCustomer(userId, sourceId) {
  try {
    const user = await getUserById(userId, { lean: true });
    return stripeClient.customers.create({
      email: user.auth.email,
      source: sourceId,
      metadata: {
        userId,
      },
    });
  } catch (err) {
    log.fatal({ err, userId }, 'failed to get user');
    throw err;
  }
};

module.exports.updateCustomer = function updateCustomer(customerId, body) {
  return stripeClient.customers.update(customerId, body);
};

module.exports.subscribeToPlan = function subscribeToPlan(customerId, planId) {
  return stripeClient.subscriptions.create({
    customer: customerId,
    items: [{ plan: planId }],
  });
};

module.exports.handleStripeError = function handleStripeError(err, res) {
  const { type, message } = err;
  switch (type) {
    case 'StripeCardError':
      log.error({ err }, 'Stripe card error');
      return res.status(400).send({
        error: type,
        message,
      });
    case 'RateLimitError':
      return res.status(429).send({
        error: type,
        message: 'Too many requests sent too quickly',
      });
    case 'StripeInvalidRequestError':
      log.fatal({ err }, 'Stripe received incorrect params');
      return res.status(500).send(errors.ERR_SRV);
    case 'StripeAPIError':
    case 'StripeConnectionError':
    case 'StripeAuthenticationError':
      log.fatal({ err }, 'stripe error');
      return res.status(500).send(errors.ERR_SRV);
    default:
      log.fatal({ err }, 'payment error');
      return res.status(500).send(errors.ERR_SRV);
  }
};

module.exports.getPlan = function getPlan(planId) {
  return stripeClient.plans.retrieve(planId);
};
