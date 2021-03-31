/* global it,describe,beforeEach,afterEach */

const jwt = require('jsonwebtoken');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const _ = require('lodash');
const roomMockJson = require('../room.mock');

proxyquire.noCallThru();
proxyquire.noPreserveCache();

let socket;
let roomMock;
let controller;
let roomUtilsStub;
let roomSaveStub;

describe('banUser', () => {
  beforeEach(() => {
    socket = {
      id: 'socket',
      handshake: {
        query: {
          token: jwt.sign({ session: 'sessionId' }, 'foo'),
        },
        headers: {
          'x-forwarded-for': '1.2.3.4',
        },
      },
    };
    roomMock = _.cloneDeep(roomMockJson);
    roomSaveStub = sinon.stub().yields();

    roomMock.save = roomSaveStub;
    roomUtilsStub = {
      getRoomByName: () => Promise.resolve(roomMock),
      getSocketCacheInfo: sinon.stub().resolves({ name: 'room' }),
    };
    controller = proxyquire('../../controllers/moderation/room.moderation.banUser', {
      '../../room.utils': roomUtilsStub,
      '../../../../utils/utils': {
        createError: () => new Error(),
        getIpFromSocket: () => '1.2.3.4',
      },
      '../../../role/role.utils': {
        getUserHasRolePermissions: sinon.stub().resolves(true),
      },
    });
  });

  describe('room mod', () => {
    it('should not allow user to ban themselves', (done) => {
      socket.id = 'y9VC65Fqtvonv5LFAAAD';
      const userListId = '560058276354652c31b88139';

      controller(socket, 'room', userListId, 1, (err) => {
        expect(err).to.equal('ERR_SELF_BAN');
        done();
      });
    });

    it('should not allow user to ban admins', (done) => {
      socket.id = 'y9VC65Fqtvonv5LFAAAD';
      const userListId = '5601cd64fd74f7a83a2854c7';
      controller(socket, 'room', userListId, 1, (err) => {
        expect(err).to.equal('ERR_BAN_ADMIN');
        done();
      });
    });

    it('should not allow user to ban room owner', (done) => {
      socket.id = 'y9VC65Fqtvonv5LFAAAD';
      const userListId = 'ownerid';
      controller(socket, 'room', userListId, 1, (err) => {
        expect(err).to.equal('ERR_BAN_OWNER');
        done();
      });
    });

    it('should not allow user to ban a permanent mod', (done) => {
      socket.id = 'ownersocket';
      const userListId = '560058276354652c31b88139';
      controller(socket, 'room', userListId, 1, (err) => {
        expect(err).to.equal('ERR_BAN_PERM_OP');
        done();
      });
    });

    it('should ban a user', (done) => {
      socket.id = 'ownersocket';
      const userListId = '5601cd64fd74f7a83a2854c6';
      controller(socket, 'room', userListId, 1, (err, userToBan) => {
        expect(userToBan.socket_id).to.equal('CIYAFaZSRpCWGwWyAAAC');
        done();
      });
    });

    it('should add banned user to banlist', (done) => {
      socket.id = 'ownersocket';
      const userListId = '5601cd64fd74f7a83a2854c6';
      controller(socket, 'room', userListId, 24, () => {
        expect(roomMock.banlist[0].handle).to.equal('guest-389948');
        done();
      });
    });

    it('should add user ID to banlist item if user has account', (done) => {
      socket.id = 'ownersocket';
      const userListId = 'registeredid';
      controller(socket, 'room', userListId, 1, () => {
        expect(roomMock.banlist[0].user_id).to.equal('registereduser');
        done();
      });
    });
  });

  describe('admin user', () => {
    it('should allow admin user to ban a room owner', (done) => {
      socket.id = 'CIYAFaZSRpCWGwWyAAAD';
      const userListId = 'ownerid';
      controller(socket, 'room', userListId, 1, () => {
        expect(roomMock.banlist[0].user_id).to.equal('owneruser');
        done();
      });
    });

    it('should allow admin user to ban a permanent mod', (done) => {
      socket.id = 'CIYAFaZSRpCWGwWyAAAD';
      const userListId = '560058276354652c31b88139';
      controller(socket, 'room', userListId, 1, () => {
        expect(roomMock.banlist[0].user_id).to.equal('56a2a3bdab2de08c2aa998fa');
        done();
      });
    });
  });
});
