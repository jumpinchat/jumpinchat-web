/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

describe('Room Remove Controller', () => {
  mock.stopAll();
  const remove = sinon.stub().yields();

  const save = sinon.stub().yields();

  let roomMockData;

  let removePlaylistByRoomId;
  let getRoomByName;
  let removeJanusRoom;
  let controller;

  let roomUtilsStubs;

  const getController = () => mock.reRequire('./room.remove');

  beforeEach(() => {
    roomMockData = {
      _id: 'abc',
      name: 'foo',
      attrs: {
        owner: 'foo',
        janusServerId: 'server',
        janus_id: 1234,
      },
      save,
    };

    removePlaylistByRoomId = sinon.stub().returns(Promise.resolve());
    getRoomByName = sinon.stub().returns(Promise.resolve(roomMockData));
    removeJanusRoom = sinon.stub().returns(Promise.resolve());

    roomUtilsStubs = {
      getRoomByName,
      removeJanusRoom,
    };

    mock('../room.utils', roomUtilsStubs);

    mock('../room.model', {
      deleteOne: remove,
    });

    mock('../../youtube/playlist.utils', {
      removePlaylistByRoomId,
    });

    mock('../../role/role.utils', {
      removeRoomRoles: () => Promise.resolve(),
      removeRoomEnrollments: () => Promise.resolve(),
    });

    controller = getController();
  });

  it('should remove the Janus room', (done) => {
    controller(roomMockData, () => {
      expect(removeJanusRoom.getCall(0).args[0]).to.equal('server');
      expect(removeJanusRoom.getCall(0).args[1]).to.equal(1234);
      done();
    });
  });

  it('should not remove a room with an owner ID in attrs', (done) => {
    controller(roomMockData, () => {
      expect(remove.called).to.equal(false);
      done();
    });
  });

  it('should remove a room without an owner ID', (done) => {
    roomUtilsStubs = {
      ...roomUtilsStubs,
      getRoomByName: sinon.stub().returns(Promise.resolve({
        ...roomMockData,
        attrs: {
          ...roomMockData.attrs,
          owner: undefined,
        },
      })),
    };

    mock('../room.utils', roomUtilsStubs);

    controller = getController();
    controller(roomMockData, () => {
      expect(remove.called).to.equal(true);
      done();
    });
  });

  it('should remove playlist', (done) => {
    controller(roomMockData, () => {
      expect(removePlaylistByRoomId.called).to.equal(true);
      expect(removePlaylistByRoomId.getCall(0).args[0]).to.equal('abc');
      done();
    });
  });
});
