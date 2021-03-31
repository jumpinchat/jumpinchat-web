const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Fetch banlist socket', () => {
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
  });

  const getSocketCacheInfo = sinon.stub().resolves({
    handle: 'foo',
    color: '#000000',
    userListId: '123',
  });

  let checkOperatorPermissions;
  let fetchBanlist;

  const messageFactory = sinon.stub().callsFake(msg => msg);

  const defaultControllerOpts = {
    operatorPermissions: true,
  };

  const createController = (opts = defaultControllerOpts) => {
    checkOperatorPermissions = sinon.stub().yields(null, opts.operatorPermissions);
    fetchBanlist = sinon.stub().yields(null, ['foo', 'bar']);

    return proxyquire('../../sockets/fetchBanlist.socket.js', {
      '../../role/role.utils': {
        getUserHasRolePermissions: sinon.stub().resolves(true),
      },
      '../room.utils': {
        getSocketCacheInfo,
        checkOperatorPermissions,
      },
      '../room.controller': {
        fetchBanlist,
      },
      '../../../utils/utils': {
        messageFactory,
      },
    });
  };

  beforeEach(function beforeEach() {
    this.timeout(5000);
  });

  it('should emit the banlist to the client', (done) => {
    socket = createController();
    const emit = (msg, body) => {
      if (msg === 'client::banlist') {
        expect(body).to.eql({ list: ['foo', 'bar'] });
        done();
      }

      if (msg === 'client::error') {
        done(Error(msg));
      }
    };
    const controller = socket(socketMock(emit));
    controller();
  });
});
