/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Handle message socket', () => {
  let socket;
  const socketEmitSpy = sinon.spy();
  const ioEmitSpy = sinon.spy();

  const socketMock = (emit = socketEmitSpy) => ({
    id: 'foo',
    emit,
  });

  const ioMock = (emit = ioEmitSpy) => ({
    to: sinon.stub().returns({
      emit,
    }),
    in: sinon.stub().returns({
      clients: sinon.stub().yields(null, [1, 2, 3]),
    }),
  });

  const changeHandleResult = {
    uuid: '123',
    newHandle: 'bar',
    oldHandle: 'foo',
  };

  const getSocketCacheInfo = sinon.stub().yields(null, {
    handle: 'foo',
    color: '#000000',
    userListId: '123',
  });

  const messageFactory = sinon.stub().callsFake(msg => msg);

  beforeEach(function beforeEach() {
    this.timeout(5000);

    socket = proxyquire('../../sockets/handleMessage.socket.js', {
      '../room.utils': {
        getSocketCacheInfo,
        checkUserSilenced: sinon.stub().returns(Promise.resolve()),
      },
      '../../../utils/utils': {
        messageFactory,
      },
      '../../../utils/socketFloodProtect': () => Promise.resolve(),
      '../utils/room.utils.sendPush': sinon.spy(),
    });
  });

  it('should send a message to the room', (done) => {
    const emit = (msg) => {
      if (msg === 'room::message') {
        expect(messageFactory.getCall(0).args[0]).to.eql({
          handle: 'foo',
          color: '#000000',
          userId: '123',
          message: 'message',
        });
        done();
      }
    };
    const controller = socket(socketMock(), ioMock(emit));
    controller({ message: 'message' });
  });
});
