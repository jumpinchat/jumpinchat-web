const moment = require('moment');
const log = require('../../../utils/logger.util')({ name: 'createPayment.controller' });
const errors = require('../../../config/constants/errors');
const { getUserById } = require('../../user/user.utils');
const paymentUtils = require('../payment.utils');
const metaSendMessage = require('../../message/utils/metaSendMessage.util');
const {
  PAYMENT_ONETIME,
  PAYMENT_GIFT_RECIPIENT,
  PAYMENT_GIFT_SENDER,
} = require('../../message/message.constants');
const {
  productIds,
  productTypes,
  products,
} = require('../payment.constants');

module.exports = async function createPayment(req, res) {
  const { product, amount, beneficiary } = req.query;
  const { stripeToken } = req.body;

  if (!product) {
    return res.status(400).send({
      error: 'ERR_NO_PRODUCT',
      message: 'Product is missing',
    });
  }

  if (!stripeToken) {
    return res.status(400).send({
      error: 'ERR_NO_TOKEN',
      message: 'Card token is missing',
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
  const existingPayment = await paymentUtils.getPaymentByUserId(req.user._id);


  if (productDetail.type === productTypes.TYPE_PLAN) {
    let user;

    try {
      user = await getUserById(req.user._id, { lean: false });
    } catch (err) {
      log.fatal({ err }, 'failed to get user');
      return res.status(500).send(errors.ERR_SRV);
    }


    if (existingPayment && user.attrs.isGold) {
      return res.status(422).send({
        error: 'ERR_SUBSCRIPTION_EXISTS',
        message: 'You are already subscribed, check your account settings for more information',
      });
    }

    try {
      let customerId;

      if (existingPayment && existingPayment.customerId) {
        ({ customerId } = existingPayment);
      } else {
        const customer = await paymentUtils.createCustomer(String(req.user._id), stripeToken);
        customerId = customer.id;
      }

      const subscription = await paymentUtils.subscribeToPlan(customerId, productDetail.id);

      if (existingPayment) {
        existingPayment.subscription.id = subscription.id;
        existingPayment.subscription.planId = productDetail.id;
        await existingPayment.save();
      } else {
        await paymentUtils.savePayment(user._id, customerId, subscription.id, productDetail.id);
      }

      log.info({ product: products[product] }, 'payment successful');

      user.attrs.isSupporter = true;
      user.attrs.isGold = true;

      const supportDuration = (1000 * 60 * 60 * 24 * 31);
      const currentExpire = user.attrs.supportExpires;
      log.debug({ supportDuration, currentExpire }, 'adding support exipiry to user');

      if (currentExpire && moment(currentExpire).isAfter(moment())) {
        log.debug('adding time to existing support');
        user.attrs.supportExpires = new Date(new Date(currentExpire).getTime() + supportDuration);
      } else {
        log.debug('setting new support expire time');
        user.attrs.supportExpires = new Date(Date.now() + supportDuration);
      }

      const updatedUser = await user.save();

      paymentUtils.applySupporterTrophy(updatedUser._id, true);

      const plan = await paymentUtils.getPlan(productDetail.id);
      paymentUtils.notifySlack(user, plan);

      return res.status(200).send({
        productId: product,
      });
    } catch (err) {
      return paymentUtils.handleStripeError(err, res);
    }
  }

  if (productDetail.type === productTypes.TYPE_CHARGE) {
    const userId = beneficiary || req.user._id;
    const user = await getUserById(userId, { lean: false });
    try {
      const charge = await paymentUtils.createCharge(amount, stripeToken, String(req.user._id));

      user.attrs.isSupporter = true;

      const supportDuration = (1000 * 60 * 60 * 24 * 14) * (amount / 300);
      const currentExpire = user.attrs.supportExpires;
      log.debug({ supportDuration, currentExpire }, 'adding support exipiry to user');

      if (currentExpire && moment(currentExpire).isAfter(moment())) {
        user.attrs.supportExpires = new Date(new Date(currentExpire).getTime() + supportDuration);
      } else {
        user.attrs.supportExpires = new Date(Date.now() + supportDuration);
      }

      log.debug({ supportExpires: user.attrs.supportExpires });

      log.info({ charge, product: productDetail }, 'Stripe charge created');

      const updatedUser = await user.save();

      paymentUtils.applySupporterTrophy(updatedUser._id, false);

      const slackMsg = beneficiary
        ? `single gift donation of $${amount / 100} to ${user.username}`
        : `single donation of $${amount / 100}`;

      paymentUtils.notifySlack(req.user, {
        nickname: slackMsg,
      });

      try {
        if (beneficiary) {
          const profileUri = `/profile/${req.user.username}`;
          const recipientMessage = `[${req.user.username}](${profileUri}) has gifted you $${amount / 100} worth of site supporter status`;

          paymentUtils.applyGiftTrophies(req.user._id, userId);
          await metaSendMessage(userId, recipientMessage);
          await metaSendMessage(req.user._id, PAYMENT_GIFT_SENDER);
        } else {
          await metaSendMessage(userId, PAYMENT_ONETIME);
        }
      } catch (messageErr) {
        log.fatal({ err: messageErr }, 'failed to deliver message');
      }

      return res.status(200).send({
        productId: product,
      });
    } catch (err) {
      return paymentUtils.handleStripeError(err, res);
    }
  }

  return res.status(400).send({
    message: 'Invalid product',
  });
};
