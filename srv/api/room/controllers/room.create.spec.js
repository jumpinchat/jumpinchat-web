const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

describe('Room Create Controller', () => {
  mock.stopAll();
  let createJanusRoomSpy;
  let getRoomSpy;
  let roomSaveSpy;
  let createSpy;
  let controller;

  const getController = () => mock.reRequire('./room.create');

  beforeEach(() => {
    roomSaveSpy = sinon.stub().yields(null);
    createJanusRoomSpy = sinon.stub().returns(Promise.resolve({ janusRoomId: 123, serverId: 'server' }));
    getRoomSpy = sinon.stub().returns(Promise.resolve(null));
    createSpy = sinon.stub().returns(Promise.resolve());

    mock('../room.utils', {
      createJanusRoomAsync: createJanusRoomSpy,
      getRoomByName: getRoomSpy,
    });

    mock('../room.model', {
      create: createSpy,
    });

    mock('../../role/controllers/createRole.controller', () => Promise.resolve());

    mock('../../role/role.utils', {
      createDefaultRoles: () => ({
        tag: 'mods',
      }),
    });

    mock('../../role/controllers/createRole.controller', () => Promise.resolve({ tag: 'mods', _id: 'modId' }));
    mock('../../role/controllers/addUserToRole.controller', () => Promise.resolve());

    controller = getController();
  });

  describe('new room', () => {
    it('should throw error if no room name', (done) => {
      const room = {
        ip: '1.2.3.4',
      };

      controller(room, null, (err) => {
        expect(err).to.equal('ERR_NO_ROOM_NAME');
        done();
      });
    });

    it('should create a janus room', (done) => {
      const room = {
        name: 'foo',
        ip: '1.2.3.4',
      };

      controller(room, null, (err) => {
        if (err) throw err;
        expect(createJanusRoomSpy.called).to.equal(true);
        done();
      });
    });

    it('should create a guest room if no user is supplied', (done) => {
      const room = {
        name: 'foo',
        ip: '1.2.3.4',
      };

      controller(room, null, () => {
        expect(createSpy.firstCall.args[0]).to.eql({
          name: 'foo',
          attrs: {
            creation_ip: '1.2.3.4',
            janus_id: 123,
            janusServerId: 'server',
            owner: null,
          },
          settings: {
            moderators: [],
          },
        });

        done();
      });
    });

    it('should create a user room if a user is supplied', (done) => {
      const room = {
        name: 'foo',
        ip: '1.2.3.4',
      };

      const user = {
        username: 'bar',
        _id: 'userId',
        session_id: 'sessionId',
      };

      controller(room, user, () => {
        expect(createSpy.firstCall.args[0]).to.eql({
          name: 'bar',
          attrs: {
            creation_ip: '1.2.3.4',
            janus_id: 123,
            janusServerId: 'server',
            owner: 'userId',
          },
          settings: {
            moderators: [],
            public: false,
          },
        });

        done();
      });
    });
  });


  describe('existing room', () => {
    beforeEach(() => {
      getRoomSpy = sinon.stub().returns(Promise.resolve({
        attrs: {},
        save: roomSaveSpy,
        settings: {},
      }));

      mock('../room.utils', {
        createJanusRoom: createJanusRoomSpy,
        getRoomByName: getRoomSpy,
      });

      controller = getController();
    });

    it('should set owner ID', (done) => {
      const room = {
        name: 'foo',
        ip: '1.2.3.4',
        settings: {},
      };

      const user = {
        username: 'bar',
        _id: 'userId',
        session_id: 'sessionId',
      };

      controller(room, user, () => {
        expect(roomSaveSpy.called).to.equal(true);
        expect(createJanusRoomSpy.called).to.equal(false);
        done();
      });
    });
  });
});
