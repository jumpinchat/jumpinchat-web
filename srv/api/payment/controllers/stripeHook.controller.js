const Stripe = require('stripe');
const config = require('../../../config/env');
const log = require('../../../utils/logger.util')({ name: 'stripeEvent.controller' });
const { stripeEvents } = require('../payment.constants');
const {
  deletePayment,
  getPaymentByCustomerId,
  updateExpire,
} = require('../payment.utils');
const fulfillPayment = require('./fulfillPayment.controller');

const stripe = Stripe(config.payment.stripe.secretKey);

module.exports = async function stripeHook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = config.payment.stripe.whKey;
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    log.info({ stripeEvent: event }, 'stripe.event');

    const { type } = event;

    switch (type) {
      case stripeEvents.SUBSCRIPTION_DELETE: {
        const customerId = event.data.object.customer;
        const payment = await getPaymentByCustomerId(customerId);
        try {
          if (payment) {
            await deletePayment(payment._id);
          } else {
            log.error({ customerId, type }, 'no payment found');
          }
        } catch (err) {
          log.fatal({ err }, 'failed to get payment');
        }
        break;
      }
      case stripeEvents.INVOICE_PAID: {
        const customerId = event.data.object.customer;
        try {
          const payment = await getPaymentByCustomerId(customerId);
          // if a payment exists, meaning a customer is an existing subscriber,
          // update the support expiration time.
          if (payment) {
            await updateExpire(payment._id, payment.userId);
          }
        } catch (err) {
          log.fatal({ err }, 'failed to get payment');
        }
        break;
      }
      case stripeEvents.SESSION_COMPLETED: {
        const session = event.data.object;
        try {
          await fulfillPayment(session);
          return res.status(200).send({ received: true });
        } catch (err) {
          log.fatal({ err }, 'failed to fulfill payment');
          return res.status(500).send(err);
        }
      }
      default:
        break;
    }
  } catch (err) {
    log.error({ err }, 'error receiving event');
    return res.status(400).send(err);
  }

  return res.status(200).send({ received: true });
};
