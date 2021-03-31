/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const socketId = 'socketId';
let changeHandle;

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

const roomSaveStub = sinon.stub().yields(null, roomMockData);

const roomMock = Object.assign({}, roomMockData, { save: roomSaveStub });

describe('Room Change Handle Controller', () => {
  beforeEach(() => {
    changeHandle = proxyquire('../../controllers/room.changeHandle', {
      '../room.utils': {
        getRoomByName: sinon.stub().yields(null, roomMock),
      },
      '../../../lib/redis.util': () => ({
        hmset: sinon.stub().yields(),
        hgetall: sinon.stub().yields(null, {
          name: 'roomName',
        }),
      }),
    });
  });

  it('should return error when handle is over 16 chars', (done) => {
    changeHandle(socketId, 'aaaaaaaaaaaaaaaaa', (err) => {
      expect(err.error).to.equal('ERR_HANDLE_LENGTH');
      done();
    });
  });

  it('should return error when handle is empty', (done) => {
    changeHandle(socketId, '', (err) => {
      expect(err.error).to.equal('ERR_NO_HANDLE');
      done();
    });
  });

  it('should return error when handle contains invalid characters', (done) => {
    changeHandle(socketId, 'abc"£$%"', (err) => {
      expect(err.error).to.equal('ERR_HANDLE_VALIDATION');
      done();
    });
  });

  it('should return error if handle already exists', (done) => {
    changeHandle(socketId, 'handle', (err) => {
      expect(err.error).to.equal('ERR_HANDLE_EXISTS');
      done();
    });
  });

  it('should work with a good handle', (done) => {
    changeHandle(socketId, 'foobar', (err, savedRoom) => {
      expect(savedRoom).to.eql({
        newHandle: 'foobar',
        oldHandle: 'handle',
        room: 'roomName',
        user: roomMockData.users[0],
        uuid: 'userId',
      });

      done();
    });
  });
});
