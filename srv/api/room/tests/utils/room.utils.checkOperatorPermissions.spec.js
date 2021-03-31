/* global it,describe,beforeEach,afterEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const _ = require('lodash');

proxyquire.noCallThru();
proxyquire.noPreserveCache();

let roomMock;
let controller;
let roomUtilsStub;
let userUtilsStub;
let logStub;

describe('Check operator permissions', () => {
  beforeEach(() => {
    roomMock = Object.assign({}, require('../room.mock.json'));

    roomUtilsStub = {
      getRoomByName: sinon.stub().yields(null, roomMock),
      getSocketCacheInfo: sinon.stub().yields(null, {
        name: 'name',
      }),
    };

    userUtilsStub = {
      getUserById: sinon.stub().yields(null, { attrs: { userLevel: 0 } }),
    };

    logStub = {
      getLogger: sinon.stub().returns({
        warn: sinon.spy(),
        info: sinon.spy(),
        error: sinon.spy(),
      }),
    };

    controller = proxyquire('../../utils/room.utils.checkOperatorPermissions', {
      '../room.utils': roomUtilsStub,
      '../../user/user.utils': userUtilsStub,
      log4js: logStub,
      '../../role/controllers/getUserRoles.controller': sinon.stub().resolves([
        {
          permissions: {
            foo: true,
          },
        },
      ]),
    });
  });

  afterEach(() => {
    roomUtilsStub.getRoomByName.reset();
    roomUtilsStub.getSocketCacheInfo.reset();
  });


  it('should return false if user is not in mod list', (done) => {
    const socketId = roomMock.users[4].socket_id;
    const action = 'ban';

    controller(socketId, action, (err, permission) => {
      expect(permission).to.equal(false);
      return done();
    });
  });

  it('should return false if user has no operator_id in their object', (done) => {
    const socketId = roomMock.users[4].socket_id;
    const action = 'ban';

    controller(socketId, action, (err, permission) => {
      expect(permission).to.equal(false);
      done();
    });
  });

  it('should return true if user has permissions', (done) => {
    const socketId = roomMock.users[0].socket_id;
    const action = 'foo';

    return controller(socketId, action, (err, permission) => {
      if (err) return done(err);
      try {
        expect(permission).to.equal(true);
        return done();
      } catch (e) {
        return done(e);
      }
    });
  });

  it('should return false if a guest user dos not have a matching session ID', (done) => {
    const socketId = 'guest';
    const action = 'ban';

    controller(socketId, action, (err, permission) => {
      expect(permission).to.equal(false);
      done();
    });
  });

  it('should return false if action is not allowed in permissions', (done) => {
    const socketId = roomMock.users[0].socket_id;
    const action = 'assign_operator';

    controller(socketId, action, (err, permission) => {
      expect(permission).to.equal(false);
      done();
    });
  });

  it('should allow an admin to perform op actions', (done) => {
    const socketId = roomMock.users[2].socket_id;
    const action = 'ban';
    userUtilsStub = {
      getUserById: sinon.stub().yields(null, { attrs: { userLevel: 30 } }),
    };

    controller = proxyquire('../../utils/room.utils.checkOperatorPermissions', {
      '../room.utils': roomUtilsStub,
      '../../user/user.utils': userUtilsStub,
      log4js: logStub,
    });

    controller(socketId, action, (err, permission) => {
      expect(permission).to.equal(true);
      done();
    });
  });
});
