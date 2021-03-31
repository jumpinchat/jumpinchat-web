const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

proxyquire.noCallThru();
proxyquire.noPreserveCache();

let handleStripeError;
const getSessionById = sinon.stub().returns(Promise.resolve({
  userId: {
    _id: 'foo',
  },
  checkoutSessionId: 'foo',
}));

const getPaymentByCustomerId = sinon.stub().returns(Promise.resolve({
  userId: 'foo',
  subscription: {},
}));

const getUserById = sinon.stub().returns(Promise.resolve({
  _id: 'foo',
  attrs: {
    isGold: false,
  },
}));

describe('fulfillPayment controller', () => {
  let session;
  const savePayment = sinon.stub().returns(Promise.resolve({}));
  const getController = (overrides = {}) => {
    handleStripeError = sinon.spy();
    const mocks = {
      '../payment.utils': {
        savePayment,
        applySupporterTrophy: sinon.spy(),
        getSessionById,
        getPaymentByCustomerId,
        handleStripeError,
        ...overrides.paymentUtils,
      },
      '../../user/user.utils': {
        getUserById,
        ...overrides.userUtils,
      },
      '../../message/utils/metaSendMessage.util': sinon.stub().returns(Promise.resolve()),
    };

    return proxyquire('./fulfillPayment.controller', mocks);
  };


  beforeEach(() => {
    session = {
      id: 'session',
      customer: 'customer',
      display_items: [{}],
      subscription: 'sub',
    };
  });


  it('should retreieve a session', () => {
    const controller = getController();
    controller(session);

    expect(getSessionById.called).to.equal(true);
    expect(getSessionById.firstCall.args[0]).to.equal(session.id);
  });
  it('should retreieve a plan', () => {
    const controller = getController();
    controller(session);

    expect(getPaymentByCustomerId.called).to.equal(true);
    expect(getPaymentByCustomerId.firstCall.args[0]).to.equal(session.customer);
  });

  describe('plan', () => {
    beforeEach(() => {
      session.display_items[0] = {
        plan: {
          id: 'plan',
          product: 'productId',
        },
      };
    });

    it('should return an error if user is gold', async () => {
      const user = sinon.stub().returns(Promise.resolve({
        _id: 'foo',
        attrs: {
          isGold: true,
        },
        save: sinon.stub().returns(Promise.resolve({ _id: 'foo' })),
      }));

      const controller = getController({
        userUtils: {
          getUserById: user,
        },
        paymentUtils: {
          getPaymentByCustomerId: sinon.stub().returns(Promise.resolve({ subscription: { id: 'foo' } })),
        },
      });

      const result = await controller(session);
      expect(result instanceof Error).to.equal(true);
      expect(result.message).to.equal('SubscriptionExistsError');
    });

    it('should create new payment if none exists', async () => {
      const controller = getController({
        paymentUtils: {
          getPaymentByCustomerId: sinon.stub().returns(Promise.resolve(null)),
        },
      });

      await controller({
        ...session,
        id: 'foo',
        customer: 'customerId',
        subscription: 'subscriptionId',
      });

      expect(savePayment.firstCall.args).to.eql([
        'foo',
        'customerId',
        'subscriptionId',
        'plan',
      ]);
    });

    it('should save an existing payment if it exists', async () => {
      const paymentSave = sinon.stub().returns(Promise.resolve());
      const payment = {
        save: paymentSave,
        subscription: {},
      };

      const controller = getController({
        paymentUtils: {
          getPaymentByCustomerId: sinon.stub().returns(Promise.resolve(payment)),
        },
      });

      await controller({
        ...session,
        id: 'foo',
        customer: 'customerId',
        subscription: 'subscriptionId',
      });

      expect(payment).to.eql({
        save: paymentSave,
        subscription: {
          planId: 'plan',
          id: 'subscriptionId',
        },
        customerId: 'customerId',
      });

      expect(paymentSave.called).to.equal(true);
    });
  });
});
