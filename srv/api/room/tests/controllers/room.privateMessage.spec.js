/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

let privateMessage;

const roomMockData = {
  name: 'foo',
  users: [
    {
      _id: 'userId',
      handle: 'handle',
      socket_id: 'socketId',
    },
  ],
};

const mockUserData = {
  settings: {
    allowPrivateMessages: true,
  },
};

const getRoomByName = sinon.stub().yields(null, roomMockData);
const setSocketByListId = sinon.stub().yields();
const getSocketIdFromListId = sinon.stub().yields(null, 'targetSocketId');
const getSocketIdFromRoom = sinon.stub().yields(null, {
  socketId: 'targetSocketId',
  userId: 'targetUserId',
});
const setSocketIdByListId = sinon.stub().yields();

const getUserById = sinon.stub().yields(null, mockUserData);

const roomUtilsStubs = {
  getRoomByName,
  setSocketByListId,
  getSocketIdFromListId,
  getSocketIdFromRoom,
  setSocketIdByListId,
};


describe('Private message controller', () => {
  beforeEach(() => {
    privateMessage = proxyquire('../../controllers/room.privateMessage', {
      '../room.utils': roomUtilsStubs,
      '../../user/user.utils': {
        getUserById,
      },
    });
  });

  it('should attempt to get the socket by user list ID', (done) => {
    privateMessage('room', 'socketId', 'userId', () => {
      expect(getSocketIdFromListId.called).to.equal(true);
      expect(getSocketIdFromListId.firstCall.args[0]).to.equal('userId');
      done();
    });
  });

  it('should get socket ID from room if not set in cache', (done) => {
    privateMessage = proxyquire('../../controllers/room.privateMessage', {
      '../room.utils': Object.assign({}, roomUtilsStubs, {
        getSocketIdFromListId: sinon.stub().yields(),
      }),
      '../../user/user.utils': {
        getUserById,
      },
    });

    privateMessage('room', 'socketId', 'userId', () => {
      expect(getSocketIdFromRoom.called).to.equal(true);
      done();
    });
  });

  it('should fail if user does not allow messages', (done) => {
    const getUserByIdNoMsg = sinon.stub().yields(null, {
      settings: {
        allowPrivateMessages: false,
      },
    });

    privateMessage = proxyquire('../../controllers/room.privateMessage', {
      '../room.utils': Object.assign({}, roomUtilsStubs, {
        getSocketIdFromListId: sinon.stub().yields(),
      }),
      '../../user/user.utils': {
        getUserById: getUserByIdNoMsg,
      },
    });

    privateMessage('room', 'socketId', 'userId', (err) => {
      expect(err).to.eql({
        message: 'user does not allow private messages',
      });

      done();
    });
  });

  it('should return target socket ID', (done) => {
    privateMessage('room', 'socketId', 'userId', (err, socketId) => {
      expect(socketId).to.equal('targetSocketId');
      done();
    });
  });

  xit('should return socket ID if socket ID not already in cache', (done) => {
    done();
  });

  xit('should return socket ID if socket ID not already in cache and sending to registered user', (done) => {
    done();
  });
});
