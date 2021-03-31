/* global it,describe */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('sendPush', () => {
  let controller;
  let webPush;
  let roomUtils;
  beforeEach(() => {
    webPush = {
      sendNotification: sinon.stub().returns(Promise.resolve()),
    };

    roomUtils = {
      getSocketCacheInfo: sinon.stub().yields(null, {
        pushEndpoint: 'endpoint',
        pushTTL: null,
        pushKey: 'key',
        pushAuth: 'auth',
      }),
    };

    controller = proxyquire('../../utils/room.utils.sendPush', {
      'web-push': webPush,
      '../room.utils': roomUtils,
    });
  });

  it('should send a push notification', () => {
    const sender = {
      handle: 'handle',
      name: 'room',
    };
    controller('foo', sender, 'socket');
    expect(webPush.sendNotification.called).to.equal(true);
  });
});
