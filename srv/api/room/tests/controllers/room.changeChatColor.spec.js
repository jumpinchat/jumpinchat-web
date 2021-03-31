/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const socketId = 'socketId';
let changeColor;

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

let hmset;
const roomSaveStub = sinon.stub().yields(null, roomMockData);
const roomMock = Object.assign({}, roomMockData, { save: roomSaveStub });

describe('Room Change Handle Controller', () => {
  beforeEach(() => {
    hmset = sinon.stub().yields();
    changeColor = proxyquire('../../controllers/room.changeChatColor', {
      '../room.utils': {
        filterRoomUser: sinon.stub().callsFake(u => u),
        getChatColor: sinon.stub().returns('orange'),
        getRoomByName: sinon.stub().yields(null, roomMock),
      },
      '../../../lib/redis.util': () => ({
        hmset,
        hgetall: sinon.stub().yields(null, {
          name: 'roomName',
          color: '#000000',
        }),
      }),
    });
  });

  it('should fail if the color is invalid', (done) => {
    changeColor(socketId, '#b00b55', (err) => {
      expect(err.error).to.equal('ERR_COLOR_INVALID');
      done();
    });
  });

  it('should select the defined color if supplied', (done) => {
    changeColor(socketId, 'blue', (err, newColor) => {
      expect(newColor.color).to.equal('blue');
      done();
    });
  });

  it('should select the next color in the list if none is supplied', (done) => {
    changeColor(socketId, null, (err, newColor) => {
      expect(newColor.color).to.equal('orange');
      done();
    });
  });

  it('should set the new color in the returned user object', (done) => {
    changeColor(socketId, 'orange', (err, result) => {
      expect(result.user.color).to.equal('orange');
      done();
    });
  });

  it('should save the new color in redis', (done) => {
    changeColor(socketId, 'orange', () => {
      expect(hmset.getCall(0).args[0]).to.equal(socketId);
      expect(hmset.getCall(0).args[1]).to.eql({ color: 'orange' });
      done();
    });
  });
});
