/* global describe,it,beforeEach */
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const proxyquire = require('proxyquire').noCallThru();
const config = require('../../../../config/env');

describe('Get Room', () => {
  let req;
  let res;
  let sendSpy;
  let controller;

  const roomMock = {
    name: 'foo',
    attrs: {},
    save: sinon.stub().yields(),
    users: [],
  };

  const ioMock = {
    in: sinon.stub().returns({
      clients: sinon.stub().yields(null, [1, 2, 3]),
    }),
  };

  const roomControllerMock = {
    sanitizeUserList: sinon.stub().yields(),
    getSocketIo: sinon.stub().returns(ioMock),
  };

  const roomCreateSpy = sinon.stub().yields(null, {
    name: 'bar',
    attrs: {
      janusServerId: 'foo',
    },
  });

  const roomUtilsMock = {
    getRoomByName: sinon.stub()
      .yields(null, Object.assign({}, roomMock, { toObject: sinon.stub().returns(roomMock) })),
    checkModAssignedBy: sinon.stub().returns(roomMock),
    filterRoom: sinon.stub().returns(roomMock),
    createJanusRoom: sinon.stub().yields(),
  };

  beforeEach(() => {
    sendSpy = new Promise(resolve => resolve());
    req = {
      headers: { authorization: '' },
      cookies: {
        'jic.activity': jwt.sign({
          foo: 'bar',
        }, config.auth.jwt_secret),
      },
      signedCookies: {
        'jic.ident': 'foo',
      },
      params: {
        room: 'foo',
      },
      connection: { remoteAddress: '1.2.3.4' },
      sessionID: 'foo',
    };

    res = {
      status: sinon.spy(() => ({
        send: () => sendSpy,
      })),
      cookie: sinon.spy(),
    };

    controller = proxyquire('../../controllers/room.getRoom.js', {
      '../room.utils': roomUtilsMock,
      '../room.controller': roomControllerMock,
      './room.create': roomCreateSpy,
    });
  });

  it('should get a room', (done) => {
    sendSpy
      .then(() => {
        expect(res.status.firstCall.args[0]).to.equal(200);
        done();
      })
      .catch(done.fail);

    controller(req, res);
  });

  it('should create a room if no room exists', (done) => {
    roomUtilsMock.getRoomByName = sinon.stub().yields(null);
    sendSpy
      .then(() => {
        expect(res.status.firstCall.args[0]).to.equal(201);
        expect(roomCreateSpy.firstCall.args[0]).to.eql({
          ip: '1.2.3.4',
          name: 'foo',
          sessionId: 'foo',
        });
        done();
      })
      .catch(err => done(err));

    controller(req, res);
  });
});
