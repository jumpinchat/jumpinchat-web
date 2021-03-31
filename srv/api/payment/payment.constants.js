const productIds = {
  SUPPORT_ONE_TIME: 'onetime',
  SUPPORT_MONTHLY: 'monthly',
  SUPPORT_ANNUAL: 'annual',
};

const productTypes = {
  TYPE_CHARGE: 'charge',
  TYPE_PLAN: 'plan',
};

module.exports.productIds = productIds;

module.exports.productTypes = productTypes;

module.exports.products = {
  [productIds.SUPPORT_ONE_TIME]: {
    type: productTypes.TYPE_CHARGE,
  },
  [productIds.SUPPORT_MONTHLY]: {
    type: productTypes.TYPE_PLAN,
    id: 'plan_DioUaFfR6RkDQJ',
  },
  [productIds.SUPPORT_ANNUAL]: {
    type: productTypes.TYPE_PLAN,
    id: 'plan_DioVHqZfPGjykw',
  },
};

module.exports.stripeEvents = {
  SUBSCRIPTION_DELETE: 'customer.subscription.deleted',
  CHARGE_SUCCESS: 'charge.succeeded',
  INVOICE_PAID: 'invoice.payment_succeeded',
  SESSION_COMPLETED: 'checkout.session.completed',
};
