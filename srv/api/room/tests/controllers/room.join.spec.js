/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const proxyquire = require('proxyquire').noCallThru();
const roomMockJson = require('../room.mock.json');
const config = require('../../../../config/env');
const { PermissionError } = require('../../../../utils/error.util');

const sandbox = sinon.sandbox.create();
let roomMock;
let RoomJoin;
let roomJoin;

const sampleNewUser = {
  ip: '1.2.3.4',
  signature: 'superawesomesignaturebro',
  session_id: 'sessionid',
  handle: 'handle',
  socket_id: 'socketid',
};


const getController = (overrides = {}) => {
  const Controller = proxyquire('../../controllers/room.join', {
    '../room.utils': overrides.roomUtils || {},
    './room.sanitize': overrides.roomSanitize || sinon.stub().yields(),
    '../../../lib/redis.util': () => overrides.redisUtil || ({ hmset: sinon.stub().yields() }),
    '../../../utils/redis.util': {
      callPromise: sinon.stub().returns(Promise.resolve()),
    },
    '../../siteban/siteban.utils': overrides.sitebanUtils || {
      getBanlistItem: () => new Promise(resolve => resolve(null)),
    },
    jwt: overrides.jwt || {
      verify: () => Promise.resolve(),
    },
    '../../../utils/utils': overrides.utils || {
      getCookie: () => 'foo',
    },
    '../../user/user.utils': overrides.userUtils || {
      getUserById: () => Promise.resolve({
        _id: { equals: () => true },
      }),
    },
    '../../roomClose/roomClose.utils': overrides.roomClose || {
      getByRoomName: () => Promise.resolve({
        attrs: {
          owner: { equals: () => true },
        },
      }),
    },

    '../../role/role.utils': overrides.roleUtils || {
      getUserEnrollments: () => Promise.resolve([]),
      getDefaultRoles: () => Promise.resolve([]),
      getUserHasRolePermissions: () => Promise.reject(new PermissionError()),
    },
  });

  return new Controller();
};

describe('Room Join Controller', () => {
  beforeEach(() => {
    roomJoin = getController();

    roomJoin.redis = {
      hgetall: sandbox.stub().yields(),
      hmset: sandbox.stub().yields(),
    };

    roomJoin.redisUtils = {
      callPromise: sinon.stub().returns(Promise.resolve()),
    };

    roomMock = _.cloneDeep(roomMockJson);
    roomMock.users = roomMock.users.map(u => Object.assign({}, u, {
      toObject: sinon.stub().returns(u),
    }));
    roomMock.save = sinon.stub().returns(Promise.resolve(roomMock));

    roomJoin.roomUtils = Object.assign({}, roomJoin.roomUtils, {
      getRoomByName: sandbox.stub().returns(Promise.resolve(roomMock)),
      getChatColor: sandbox.stub().returns('test'),
      checkForJanusRoom: sandbox.stub().yields(null, true),
      createJanusRoom: sandbox.stub().yields(null, '123'),
      makeUserOperator: sinon.stub().returns(roomMock),
      createUniqueIntegerId: sinon.stub().returns(123),
    });
  });

  describe('getModerator', () => {
    beforeEach(() => {
      roomJoin.room = {
        settings: {
          moderators: [],
        },
      };
    });

    it('should return true if username matches', () => {
      roomJoin.room.settings.moderators = [
        {
          username: 'foo',
        },
      ];

      const user = { username: 'foo' };
      expect(roomJoin.getModerator(user)).to.eql({ username: 'foo' });
    });

    it('should return true if user ID matches', () => {
      roomJoin.room.settings.moderators = [
        {
          user_id: 'foo',
        },
      ];

      const user = { user_id: 'foo' };
      expect(roomJoin.getModerator(user)).to.eql({ user_id: 'foo' });
    });

    it('should return true if session ID matches', () => {
      roomJoin.room.settings.moderators = [
        {
          session_token: 'foo',
        },
      ];

      const user = { session_id: 'foo' };
      expect(roomJoin.getModerator(user)).to.eql({ session_token: 'foo' });
    });

    it('should return undefined if no mod found', () => {
      roomJoin.room.settings.moderators = [
        {
          session_token: 'foo',
          user_id: 'bar',
          username: 'baz',
        },
      ];

      const user = {
        username: 'aaa',
        user_id: 'bbb',
        session_id: 'ccc',
      };
      expect(roomJoin.getModerator(user)).to.equal(undefined);
    });
  });

  describe('checkRoomPasswordRequired', () => {
    beforeEach(() => {
      roomJoin.room = {
        name: 'foo',
        attrs: {
          owner: 'ownerId',
        },
        settings: {
          passhash: 'foo',
          moderators: [
            {
              user_id: 'foo',
            },
          ],
        },
      };
    });

    it('should return false if no passhash is required', async () => {
      roomJoin.room.settings.passhash = null;
      roomJoin.getCookie = () => null;
      const user = {};
      const result = await roomJoin.checkRoomPasswordRequired('', user);
      expect(result).to.equal(false);
    });

    it('should return true if passhash is set and no cookie set', async () => {
      roomJoin.getCookie = () => null;
      const result = await roomJoin.checkRoomPasswordRequired('foo', {});
      expect(result).to.equal(true);
    });

    it('should return true if passhash is set and cookie value is invalid', async () => {
      roomJoin.getCookie = () => 'foo';
      const result = await roomJoin.checkRoomPasswordRequired('foo', {});
      expect(result).to.equal(true);
    });

    it('should return true if passhash is set and cookie value has incorrect body', async () => {
      roomJoin.getCookie = () => 'foo';
      const result = await roomJoin.checkRoomPasswordRequired('foo', {});
      expect(result).to.equal(true);
    });

    it('should return false if passhash is set and cookie value is valid', async () => {
      const token = jwt.sign({ room: 'foo' }, config.auth.jwt_secret);
      roomJoin.getCookie = () => token;
      const result = await roomJoin.checkRoomPasswordRequired('foo', {});
      expect(result).to.equal(false);
    });

    it('should return false if user is site mod or above', async () => {
      const user = {
        attrs: {
          userLevel: 20,
        },
      };

      const result = await roomJoin.checkRoomPasswordRequired('foo', user);
      expect(result).to.equal(false);
    });
  });

  describe('Join Room', () => {
    beforeEach(() => {
      roomJoin.checkRoomPasswordRequired = () => Promise.resolve(false);
      roomJoin.checkRoomClosed = () => Promise.resolve(false);
    });

    it('should get a room by it\'s name', (done) => {
      const session = { kicked: false };
      roomJoin.attachClientToRoom = sinon.stub().yields(null, () => {});
      roomJoin.join('room', sampleNewUser, null, { session }, () => {
        expect(roomJoin.roomUtils.getRoomByName.called).to.equal(true);
        done();
      });
    });

    it('should add a colour to a new user', (done) => {
      roomJoin.attachClientToRoom = sinon.stub().yields(null, () => {});
      roomJoin.join('room', sampleNewUser, null, { session: {} }, () => {
        expect(roomJoin.roomUtils.getChatColor.called).to.equal(true);
        done();
      });
    });

    it('should check if a user is banned', (done) => {
      sinon.spy(roomJoin, 'checkUserIsBanned');
      roomJoin.attachClientToRoom = sinon.stub().yields(null, () => {});
      roomJoin.join('room', sampleNewUser, null, { session: {} }, () => {
        expect(roomJoin.checkUserIsBanned.getCall(0).args[0].handle).to.equal(sampleNewUser.handle);
        done();
      });
    });

    it('should create a new Janus ID if none was found', (done) => {
      roomMock.attrs.janus_id = undefined;
      roomJoin.roomUtils.createUniqueIntegerId = sinon.spy();
      roomJoin.attachClientToRoom = sinon.stub().yields(null, () => {});
      roomJoin.join('room', sampleNewUser, null, { session: {} }, () => {
        expect(roomJoin.roomUtils.createUniqueIntegerId.called).to.equal(true);
        done();
      });
    });

    xit('should create a new Janus room', (done) => {
      roomJoin.attachClientToRoom = sinon.stub().yields(null, () => {});
      roomJoin.join('room', sampleNewUser, null, { session: {} }, () => {
        expect(roomJoin.roomUtils.createJanusRoom.called).to.equal(true);
        done();
      });
    });

    it('should save the room', (done) => {
      roomJoin.attachClientToRoom = sinon.stub().yields(null, () => {});
      roomJoin.join('room', sampleNewUser, null, { session: {} }, (err) => {
        if (err) return done(err);
        expect(roomMock.save.called).to.equal(true);
        return done();
      });
    });
  });

  describe('checkUserIsBanned', () => {
    beforeEach(() => {
      roomJoin.room = {
        ...roomJoin.room,
        attrs: {},
        banlist: [],
        settings: {
          moderators: [],
        },
      };
    });

    it('should return false if banlist is empty', async () => {
      const banned = await roomJoin.checkUserIsBanned(sampleNewUser);
      expect(banned).to.equal(false);
    });

    it('should return false if ban has expired', async () => {
      roomJoin.room.banlist = [{
        ip: '1.2.3.4',
        timestamp: new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)),
        banDuration: 24,
      }];

      const banned = await roomJoin.checkUserIsBanned(sampleNewUser);
      expect(banned).to.equal(false);
    });

    it('should return true if user ID exists in banlist', async () => {
      roomJoin.room.banlist = [{
          user_id: {
            _id: '1.2.3.4',
          },
        timestamp: new Date(),
        banDuration: 24,
      }];

      const banned = await roomJoin.checkUserIsBanned({ ...sampleNewUser, user_id: '1.2.3.4' });

      expect(banned).to.equal(true);
    });

    it('should return true if user session ID exists in banlist', async () => {
      roomJoin.room.banlist = [{
        timestamp: new Date(),
        banDuration: 24,
        sessionId: 'foo',
      }];

      const banned = await roomJoin.checkUserIsBanned({ ...sampleNewUser, session_id: 'foo' });

      expect(banned).to.equal(true);
    });

    it('should return true if user ip exists in banlist', async () => {
      roomJoin.room.banlist = [{
        ip: 'foo',
        timestamp: new Date(),
        banDuration: 24,
      }];

      const banned = await roomJoin.checkUserIsBanned({ ...sampleNewUser, ip: 'foo' });

      expect(banned).to.equal(true);
    });

    it('should return site banlist item when restrictions exists', async () => {
      const getBanlistItem = () => Promise.resolve({ restrictions: { join: true } });
      const controller = getController({ sitebanUtils: { getBanlistItem } });
      controller.room = roomJoin.room;
      const banned = await controller.checkUserIsBanned({ ...sampleNewUser, ip: 'foo' });

      expect(banned).to.eql({ restrictions: { join: true } });
    });

    it('should return true if ban is within duration', async () => {
      const time = new Date();
      const banTimestamp = new Date(time.getTime() - (1000 * 60 * 60 * 12));
      roomJoin.room.banlist = [{
        ip: 'foo',
        timestamp: banTimestamp,
        banDuration: 1000 * 60 * 60 * 24,
      }];

      const banned = await roomJoin.checkUserIsBanned({ ...sampleNewUser, ip: 'foo' }, 'foo');

      expect(banned).to.equal(true);
    });

    it('should return false if ban is outside of duration', async () => {
      const time = new Date();
      const banTimestamp = new Date(time.getTime() - (1000 * 60 * 60 * 25));
      roomJoin.room.banlist = [{
        ip: 'foo',
        timestamp: banTimestamp,
        banDuration: 1000 * 60 * 60 * 24,
      }];

      const banned = await roomJoin.checkUserIsBanned({ ...sampleNewUser, ip: 'foo' });

      expect(banned).to.equal(false);
    });

    it('should return true if new guest ban list item exists along with expired ban', async () => {
      const time = new Date();
      const banTimestamp = new Date(time.getTime() - (1000 * 60 * 60 * 25));
      roomJoin.room.banlist = [
        {
          ip: 'foo',
          user_id: {
            _id: 'foo',
          },
          timestamp: new Date(time.getTime() - (1000 * 60)),
          banDuration: 1000 * 60 * 60 * 24,
        },
        {
          ip: 'foo',
          timestamp: banTimestamp,
          banDuration: 1000 * 60 * 60 * 24,
        },
      ];

      const banned = await roomJoin.checkUserIsBanned({ ...sampleNewUser, ip: 'foo' });

      expect(banned).to.equal(true);
    });

    it('should return true if new ban list item exists along with expired ban', async () => {
      const time = new Date();
      const banTimestamp = new Date(time.getTime() - (1000 * 60 * 60 * 25));
      roomJoin.room.banlist = [
        {
          ip: 'foo',
          user_id: {
            _id: 'foo',
          },
          timestamp: banTimestamp,
          banDuration: 1000 * 60 * 60 * 24,
        },
        {
          ip: 'bar',
          user_id: {
            _id: 'foo',
          },
          timestamp: new Date(time.getTime() - (1000 * 60)),
          banDuration: 1000 * 60 * 60 * 24,
        },
      ];

      const banned = await roomJoin.checkUserIsBanned({
        ...sampleNewUser,
        ip: 'baz',
        user_id: 'foo',
      });

      expect(banned).to.equal(true);
    });
  });

  describe('attachClientToRoom', () => {
    let addedUser;

    beforeEach(() => {
      addedUser = {
        ...sampleNewUser,
        handle: 'handle1',
        _id: 'id',
        color: 'color',
      };

      roomJoin.room = {
        _id: { toString: () => 'foo' },
        name: 'foo',
        attrs: {
          janus_id: 123,
          janusServerId: 'foo',
        },
        users: [
          {
            _id: { toString: () => 'foo' },
            color: '#000000',
            handle: 'handle1',
            socket_id: 'foo',
          },
        ],
      };

      roomJoin.redisUtils = {
        callPromise: sinon.stub().returns(Promise.resolve()),
      };
    });

    it('should save room name in redis', (done) => {
      roomJoin.attachClientToRoom(addedUser, 'foo', () => {
        expect(roomJoin.redisUtils.callPromise.firstCall.args[0]).to.equal('hmset');
        expect(roomJoin.redisUtils.callPromise.firstCall.args[1]).to.equal('socketid');
        expect(roomJoin.redisUtils.callPromise.firstCall.args[2]).to.eql({
          room_id: 'foo',
          name: 'foo',
          handle: 'handle1',
          color: 'color',
          janus_id: 123,
          janusServerId: 'foo',
          userListId: 'foo',
          fingerprint: 'foo',
        });
        done();
      });
    });
  });

  describe('checkModTimeout', () => {
    let moderator;

    beforeEach(() => {
      roomJoin.room = {
        attrs: {
          owner: 'foo',
        },
      };

      moderator = {
        assignedBy: 'user',
        session_token: 'foo',
        timestamp: new Date(),
      };
    });

    it('should return false if user was not assigned by someone', () => {
      moderator.assignedBy = null;
      expect(roomJoin.checkModTimeout(moderator)).to.equal(false);
    });

    it('should return false if user is not a guest mod', () => {
      moderator = {
        user_id: 'foo',
        timestamp: new Date(Date.now() - (1000 * 60 * 60 * 25)),
      };

      expect(roomJoin.checkModTimeout(moderator)).to.equal(false);
    });

    it('should return true if a moderator has timed out', () => {
      moderator.timestamp = new Date(Date.now() - (1000 * 60 * 60 * 25));
      expect(roomJoin.checkModTimeout(moderator)).to.equal(true);
    });

    it('should return false if a guest moderator has not timed out', () => {
      expect(roomJoin.checkModTimeout(moderator)).to.equal(false);
    });
  });
});
