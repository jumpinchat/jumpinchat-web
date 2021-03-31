/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

let roomSanitize;
let leaveRoom;

const roomSave = sinon.stub().yields();

let roomMockData;

const ioMock = {
  in: sinon.stub().returns({
    clients: sinon.stub().yields(null, [1, 2, 3]),
  }),
};


describe('Room Sanitize Controller', () => {
  let getRoomByName;
  const disconnectUserSocket = sinon.spy();
  const getSocketIo = sinon.stub().returns(ioMock);

  let stubs;

  beforeEach(() => {
    roomMockData = {
      name: 'foo',
      janus_id: 1234,
      attrs: { owner: 'foo' },
      users: [
        {
          socket_id: 'socketId',
        },
        {
          socket_id: 'socketId2',
        },
      ],
      save: roomSave,
    };

    getRoomByName = sinon.stub().yields(null, roomMockData);
    leaveRoom = sinon.stub().yields();
    stubs = {
      '../room.controller': {
        getSocketIo,
        leaveRoom,
      },
      '../room.utils': {
        getRoomByName,
      },
      '../sockets/disconnectUser.socket': disconnectUserSocket,
    };

    roomSanitize = proxyquire('../../controllers/room.sanitize.js', stubs);
  });

  it('should call disconnect for each socket not in the global list', (done) => {
    roomSanitize('room', () => {
      done();
    });
  });
});
