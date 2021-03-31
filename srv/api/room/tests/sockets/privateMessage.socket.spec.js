/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Private message socket', () => {
  let socket;
  const socketEmitSpy = sinon.spy();
  const ioEmitSpy = sinon.spy();

  const socketMock = (emit = socketEmitSpy) => ({
    id: 'foo',
    emit,
  });

  const ioMockTo = sinon.stub().callsFake(emit => ({
    emit,
  }));

  const ioMock = (emit = ioEmitSpy) => ({
    to: socketId => ioMockTo(emit, socketId),
  });

  const getSocketCacheInfo = sinon.stub().yields(null, {
    handle: 'foo',
    color: '#000000',
    userListId: '123',
  });

  let privateMessage;

  const messageFactory = sinon.stub().callsFake(msg => msg);
  const setSocketIdByListId = sinon.stub().yields();

  const defaultControllerOpts = {
    pm: {
      error: null,
      socketId: 'socketid',
    },
  };

  const createController = (opts = defaultControllerOpts) => {
    privateMessage = sinon.stub()
      .yields(opts.pm.error, opts.pm.socketId);

    return proxyquire('../../sockets/privateMessage.socket.js', {
      '../room.utils': {
        getSocketCacheInfo,
        setSocketIdByListId,
      },
      '../controllers/room.privateMessage': privateMessage,
      '../../../utils/utils': {
        messageFactory,
      },
      '../utils/room.utils.sendPush': sinon.spy(),
      '../../../utils/socketFloodProtect': sinon.stub().resolves(),
    });
  };

  beforeEach(function beforeEach() {
    this.timeout(5000);
  });

  it('should emit a message to target socket', (done) => {
    socket = createController();
    const emit = (msg, body) => {
      if (msg === 'room::privateMessage') {
        expect(body.message).to.equal('foo');
        done();
      }
    };

    const controller = socket(socketMock(), ioMock(emit));
    controller({ user_list_id: '1234', message: 'foo' });
  });

  it('should emit a message to sender socket', (done) => {
    socket = createController();
    const emit = (msg, body) => {
      if (msg === 'room::privateMessage') {
        expect(body.message).to.equal('foo');
        expect(body.clientIsSender).to.equal(true);
        done();
      }
    };

    const controller = socket(socketMock(emit), ioMock());
    controller({ user_list_id: '1234', message: 'foo' });
  });
});
