const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { productIds } = require('../payment.constants');

proxyquire.noCallThru();
proxyquire.noPreserveCache();

let handleStripeError;

function getController(overrides = {}) {
  handleStripeError = sinon.spy();
  const mocks = {
    '../../../utils/logger.util': () => () => {},
    '../payment.utils': {
      savePayment: () => Promise.resolve({}),
      getPaymentByUserId: () => Promise.resolve({
        customerId: 'foo',
        subscription: {},
      }),
      handleStripeError,
      ...overrides.paymentUtils,
    },
    '../../user/user.utils': {
      getUserById: () => Promise.resolve({
        _id: 'foo',
        attrs: {
          isGold: false,
        },
      }),
      ...overrides.userUtils,
    },
    '../../message/utils/metaSendMessage.util': sinon.stub().returns(Promise.resolve()),
  };
  return proxyquire('./createPayment.controller', mocks);
}

describe('createPayment controller', () => {
  let req;
  let res;

  let resSend;
  let resStatus;

  beforeEach(() => {
    resSend = sinon.stub().returns();
    resStatus = sinon.stub().returns({ send: resSend });
    req = {
      query: {
        product: productIds.SUPPORT_MONTHLY,
        amount: 5000,
      },
      body: {
        stripeToken: 'foo',
      },
      user: {
        _id: 'foo',
      },
    };

    res = {
      status: resStatus,
    };
  });

  describe('general', () => {
    it('should fail if product is missing', async () => {
      const controller = getController();
      req.query.product = undefined;
      await controller(req, res);
      expect(resStatus.called).to.equal(true);
      expect(resStatus.firstCall.args[0]).to.equal(400);
    });

    it('should fail if amount is below 300', async () => {
      const controller = getController();
      req.query.amount = 1;
      await controller(req, res);
      expect(resStatus.called).to.equal(true);
      expect(resStatus.firstCall.args[0]).to.equal(400);
    });

    it('should fail if amount is above 50001', async () => {
      const controller = getController();
      req.query.amount = 1;
      await controller(req, res);
      expect(resStatus.called).to.equal(true);
      expect(resStatus.firstCall.args[0]).to.equal(400);
    });

    it('should fail if token is missing', async () => {
      const controller = getController();
      req.body.stripeToken = undefined;
      await controller(req, res);
      expect(resStatus.called).to.equal(true);
      expect(resStatus.firstCall.args[0]).to.equal(400);
    });

    it('should fail if amount is missing and product is plan', async () => {
      const controller = getController();
      req.query.product = productIds.SUPPORT_ONE_TIME;
      req.query.amount = undefined;
      await controller(req, res);
      expect(resStatus.called).to.equal(true);
      expect(resStatus.firstCall.args[0]).to.equal(400);
    });
  });

  describe('charge', () => {
  });
  describe('plan', () => {
    it('should fail if user already subscribed', async () => {
      const getPaymentByUserId = () => ({});
      const getUserById = () => ({
        attrs: {
          isGold: true,
        },
      });
      const controller = getController({
        paymentUtils: {
          getPaymentByUserId,
        },
        userUtils: {
          getUserById,
        },
      });
      await controller(req, res);
      expect(resStatus.called).to.equal(true);
      expect(resStatus.firstCall.args[0]).to.equal(422);
    });
  });
});
