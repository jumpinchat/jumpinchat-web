const moment = require('moment');
const log = require('../../../utils/logger.util')({ name: 'fulfillPayment.controller' });
const { getUserById } = require('../../user/user.utils');
const paymentUtils = require('../payment.utils');
const metaSendMessage = require('../../message/utils/metaSendMessage.util');
const {
  PAYMENT_ONETIME,
  PAYMENT_GIFT_SENDER,
} = require('../../message/message.constants');

module.exports = async function fulfillPayment({
  id,
  customer,
  display_items: displayItems,
  subscription,
}) {
  const {
    plan,
    custom,
    amount,
  } = displayItems[0];

  let session;
  let payment;

  try {
    session = await paymentUtils.getSessionById(id);
  } catch (err) {
    log.fatal({ err }, 'failed to fetch existing payment');
    return err;
  }

  if (!session) {
    log.error({ sessionId: id }, 'session does not exist');
    return new Error('NoSessionError');
  }


  try {
    payment = await paymentUtils.getPaymentByCustomerId(customer);
  } catch (err) {
    log.fatal({ err, customerId: customer }, 'failed to fetch existing payment');
    return err;
  }

  log.debug({ payment, sessionId: id }, 'got payment');

  if (plan) {
    let user;

    try {
      user = await getUserById(session.userId._id, { lean: false });
    } catch (err) {
      log.fatal({ err }, 'failed to get user');
      return err;
    }

    if (payment && payment.subscription.id && user.attrs.isGold) {
      log.error('subscriber attempted to re-subscribe');
      return new Error('SubscriptionExistsError');
    }

    if (payment) {
      payment.subscription.id = subscription;
      payment.subscription.planId = plan.id;
      payment.customerId = customer;

      try {
        await payment.save();
        log.debug('saved existing payment');
      } catch (err) {
        log.fatal({ err }, 'failed to save existing payment');
      }
    } else {
      try {
        await paymentUtils.savePayment(user._id, customer, subscription, plan.id);
        log.debug('payment saved');
      } catch (err) {
        log.fatal({ err }, 'failed to save payment');
        return err;
      }
    }

    log.info('payment successful');

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

    try {
      const updatedUser = await user.save();
      paymentUtils.applySupporterTrophy(updatedUser._id, true);
    } catch (err) {
      log.fatal({ err }, 'failed to save user');
      return err;
    }

    try {
      await metaSendMessage(session.userId._id, PAYMENT_ONETIME);
    } catch (err) {
      log.fatal({ err }, 'failed to send message');
    }

    try {
      const stripePlan = await paymentUtils.getPlan(plan.id);
      paymentUtils.notifySlack(user, stripePlan);
    } catch (err) {
      log.fatal({ err, plan: plan.id }, 'failed to fetch stripe plan');
    }

    return true;
  }

  // charge
  if (custom) {
    let userId;
    if (session.beneficiary) {
      userId = session.beneficiary._id;
    } else {
      userId = session.userId._id;
    }

    let user;
    try {
      user = await getUserById(userId, { lean: false });
    } catch (err) {
      log.fatal({ err, userId }, 'failed to fetch user');
      return err;
    }

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

    log.info({ charge: custom }, 'Stripe charge created');

    let updatedUser;
    try {
      updatedUser = await user.save();
    } catch (err) {
      log.fatal({ err }, 'failed to save user');
      return err;
    }

    const newPayment = {
      userId: session.userId._id,
      customerId: customer,
    };

    try {
      payment = await paymentUtils.savePayment(newPayment.userId, newPayment.customerId);
    } catch (err) {
      log.fatal({ err }, 'failed to save charge payment');
      return err;
    }


    paymentUtils.applySupporterTrophy(updatedUser._id, false);

    const slackMsg = session.beneficiary
      ? `single gift donation of $${amount / 100} to ${user.username}`
      : `single donation of $${amount / 100}`;

    paymentUtils.notifySlack(session.userId, {
      nickname: slackMsg,
    });


    try {
      if (session.beneficiary) {
        const {
          beneficiary,
          userId: sender,
        } = session;

        log.debug({
          beneficiary: beneficiary._id,
          userId: sender._id,
        }, 'handle gift payment');

        const profileUri = `/profile/${beneficiary.username}`;
        const recipientMessage = `[${sender.username}](${profileUri}) has gifted you $${amount / 100} worth of site supporter status`;

        paymentUtils.applyGiftTrophies(sender._id, beneficiary._id);
        await metaSendMessage(beneficiary._id, recipientMessage);
        await metaSendMessage(sender._id, PAYMENT_GIFT_SENDER);
      } else {
        await metaSendMessage(userId, PAYMENT_ONETIME);
      }
    } catch (messageErr) {
      log.fatal({ err: messageErr }, 'failed to deliver message');
    }

    return true;
  }

  log.error('Invalid fulfullment: missing type');
  return new Error('InvalidSessionError');
};
