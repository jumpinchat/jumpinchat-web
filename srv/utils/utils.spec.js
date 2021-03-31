/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const proxyquire = require('proxyquire').noCallThru();
const config = require('../config/env');

describe('utils', () => {
  let req;
  let res;
  let next;
  let sendSpy;
  let controller;
  let redisMock;
  let userUtilsMock;
  let awsMock;

  beforeEach(function beforeEach() {
    this.timeout(5000);
    sendSpy = new Promise(resolve => resolve());
    redisMock = () => ({});
    userUtilsMock = {
      getUserById: sinon.stub().yields(null, { username: 'foo' }),
    };

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
    };

    res = {
      status: sinon.spy(() => ({
        send: () => sendSpy,
      })),
    };

    awsMock = {
      S3: class S3 { putObject() {} },
    };

    next = sinon.spy();

    controller = proxyquire('./utils.js', {
      '../api/user/user.utils': userUtilsMock,
      '../api/room/room.utils': {},
      '../lib/redis.util': redisMock,
      'aws-sdk': awsMock,
    });
  });

  describe('validateSession', () => {
    it('should reject with 401 if token missing', (done) => {
      req.cookies = {};
      controller.validateSession(req, res, next);

      sendSpy.then(() => {
        expect(res.status.firstCall.args[0]).to.equal(401);
        done();
      });
    });

    it('should call `next` if session token is verified', (done) => {
      controller.validateSession(req, res, () => {
        done();
      });
    });
  });

  describe('validateAccount', () => {
    it('should respond with a 401 if there is no ident cookie', (done) => {
      req.signedCookies = {};
      controller.validateAccount(req, res, next);

      sendSpy.then(() => {
        expect(res.status.firstCall.args[0]).to.equal(401);
        done();
      });
    });

    it('should respond with a 401 if there is no user', (done) => {
      req.signedCookies = {
        'jic.ident': 'foo',
      };

      userUtilsMock.getUserById = sinon.stub().yields(null);

      controller.validateAccount(req, res, next);

      sendSpy.then(() => {
        expect(res.status.firstCall.args[0]).to.equal(401);
        done();
      });
    });

    it('should call `next` if user found', (done) => {
      req.signedCookies = {
        'jic.ident': 'foo',
      };

      controller.validateAccount(req, res, () => {
        done();
      });
    });
  });
});
