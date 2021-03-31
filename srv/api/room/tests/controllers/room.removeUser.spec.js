/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

let removeUser;

const roomSave = sinon.stub().yields(null, { users: [{ handle: 'foo' }] });

let roomMockData;


describe('Room Remove User Controller', () => {
  let getRoomByName;
  let roomRemove;

  let stubs;

  beforeEach(() => {
    roomRemove = sinon.stub().yields();
    roomMockData = {
      name: 'foo',
      janus_id: 1234,
      attrs: { owner: 'foo' },
      users: [
        {
          handle: 'foo',
          socket_id: 'socketId',
        },
        {
          handle: 'bar',
          socket_id: 'socketId2',
        },
      ],
      save: roomSave,
    };

    getRoomByName = sinon.stub().yields(null, roomMockData);
    stubs = {
      '../room.utils': {
        getRoomByName,
      },
      './room.remove': roomRemove,
    };

    removeUser = proxyquire('../../controllers/room.removeUser.js', stubs);
  });

  it('should return the removed user', (done) => {
    removeUser('socketId', { name: 'foo' }, (err, removedUser) => {
      expect(removedUser).to.eql({ handle: 'foo', socket_id: 'socketId' });
      done();
    });
  });

  it('should not remove the room if user count > 0', (done) => {
    const roomWithOwner = Object.assign({}, roomMockData, {
      users: [
        {
          handle: 'foo',
          socket_id: 'socketId',
        },
        {
          handle: 'bar',
          socket_id: 'socketId2',
        },
      ],
      attrs: {},
      save: sinon.stub().yields(null, { users: ['foo'] }),
    });

    stubs = Object.assign({}, stubs, {
      '../room.utils': {
        getRoomByName: sinon.stub().yields(null, roomWithOwner),
      },
    });

    removeUser = proxyquire('../../controllers/room.removeUser.js', stubs);
    removeUser('socketId', { name: 'foo' }, () => {
      expect(roomRemove.called).to.equal(false);
      done();
    });
  });

  it('should remove the room if users.length === 0 and has no owner', (done) => {
    const roomWithOwner = Object.assign({}, roomMockData, {
      users: [
        {
          handle: 'foo',
          socket_id: 'socketId',
        },
      ],
      attrs: {},
      save: sinon.stub().yields(null, { users: [] }),
    });

    stubs = Object.assign({}, stubs, {
      '../room.utils': {
        getRoomByName: sinon.stub().yields(null, roomWithOwner),
      },
    });

    removeUser = proxyquire('../../controllers/room.removeUser.js', stubs);

    removeUser('socketId', { name: 'foo' }, () => {
      expect(roomRemove.called).to.equal(true);
      done();
    });
  });
});
