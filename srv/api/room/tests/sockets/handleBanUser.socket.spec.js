/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Handle ban user socket', () => {
  let socket;
  const socketEmitSpy = sinon.spy();
  const ioEmitSpy = sinon.spy();

  const socketMock = (emit = socketEmitSpy) => ({
    id: 'foo',
    emit,
  });

  const disconnectSocketSpy = sinon.spy();
  const ioMockTo = sinon.stub().callsFake(emit => ({
    emit,
  }));

  const ioMockOf = () => ({
    adapter: {
      remoteDisconnect: sinon.stub().yields(),
    },
  });

  const ioMock = (emit = ioEmitSpy) => ({
    to: socketId => ioMockTo(emit, socketId),
    of: socketId => ioMockOf(emit, socketId),
    sockets: {
      connected: {
        foo: {
          disconnect: disconnectSocketSpy,
        },
      },
    },
  });

  const getSocketCacheInfo = sinon.stub().resolves({
    handle: 'foo',
    color: '#000000',
    userListId: '123',
  });

  let checkOperatorPermissions;
  let banUser;

  const messageFactory = sinon.stub().callsFake(msg => msg);

  const defaultControllerOpts = {
    banUser: {
      error: null,
      user: {
        handle: 'mod',
        socket_id: 'foo',
      },
    },
    operatorPermissions: true,
  };

  const createController = (opts = defaultControllerOpts) => {
    checkOperatorPermissions = sinon.stub().yields(null, opts.operatorPermissions);
    banUser = sinon.stub().yields(opts.banUser.error, opts.banUser.user);

    return proxyquire('../../sockets/handleBanUser.socket.js', {
      '../room.utils': {
        getSocketCacheInfo,
        checkOperatorPermissions,
      },
      '../room.controller': {
        banUser,
      },
      '../../../utils/utils': {
        messageFactory,
      },
    });
  };

  beforeEach(function beforeEach() {
    this.timeout(5000);
  });

  it('should emit error on self ban', (done) => {
    const opts = Object.assign({}, defaultControllerOpts, {
      banUser: {
        error: 'ERR_SELF_BAN',
      },
    });
    socket = createController(opts);
    const emit = (msg, body) => {
      if (msg === 'client::error') {
        expect(body.context).to.equal('banner');
        expect(body.message).to.equal('You can not ban yourself');
        done();
      }
    };
    const controller = socket(socketMock(emit));
    controller({ user_list_id: '1234' });
  });

  it('should emit error on owner ban', (done) => {
    const opts = Object.assign({}, defaultControllerOpts, {
      banUser: {
        error: 'ERR_BAN_OWNER',
      },
    });
    socket = createController(opts);
    const emit = (msg, body) => {
      if (msg === 'client::error') {
        expect(body.context).to.equal('chat');
        expect(body.message).to.equal('You can not ban the room owner');
        done();
      }
    };
    const controller = socket(socketMock(emit));
    controller({ user_list_id: '1234' });
  });

  it('should emit error on perm op ban', (done) => {
    const opts = Object.assign({}, defaultControllerOpts, {
      banUser: {
        error: 'ERR_BAN_PERM_OP',
      },
    });
    socket = createController(opts);
    const emit = (msg, body) => {
      if (msg === 'client::error') {
        expect(body.context).to.equal('chat');
        expect(body.message).to.equal('You can not ban a moderator');
        done();
      }
    };
    const controller = socket(socketMock(emit));
    controller({ user_list_id: '1234' });
  });

  it('should emit error on admin ban', (done) => {
    const opts = Object.assign({}, defaultControllerOpts, {
      banUser: {
        error: 'ERR_BAN_ADMIN',
      },
    });
    socket = createController(opts);
    const emit = (msg, body) => {
      if (msg === 'client::error') {
        expect(body.context).to.equal('chat');
        expect(body.message).to.equal('You can not ban an admin');
        done();
      }
    };
    const controller = socket(socketMock(emit));
    controller({ user_list_id: '1234' });
  });

  it('should emit banned event to the target socket', (done) => {
    socket = createController();
    const emit = (msg) => {
      if (msg === 'self::banned') {
        done();
      }
    };
    const controller = socket(socketMock(), ioMock(emit));
    controller({ user_list_id: '1234' });
  });

  it('should emit banned event to the room', (done) => {
    socket = createController();
    const emit = (msg, body) => {
      if (msg === 'room::userbanned') {
        expect(body).to.eql({
          user: {
            handle: 'mod',
            socket_id: 'foo',
          },
        });
        done();
      }
    };
    const controller = socket(socketMock(), ioMock(emit));
    controller({ user_list_id: '1234' });
  });
});
