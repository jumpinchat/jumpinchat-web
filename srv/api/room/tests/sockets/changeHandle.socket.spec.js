/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Change Handle Socket', () => {
  let socket;
  const socketEmitSpy = sinon.spy();
  const ioEmitSpy = sinon.spy();

  const socketMock = (emit = socketEmitSpy) => ({
    id: 'foo',
    emit,
  });

  const ioMock = (emit = ioEmitSpy) => ({
    to: sinon.stub().returns({
      emit,
    }),
  });

  const changeHandleResult = {
    uuid: '123',
    newHandle: 'bar',
    oldHandle: 'foo',
  };

  const changeHandle = sinon.stub().yields(null, changeHandleResult);

  beforeEach(function beforeEach() {
    this.timeout(5000);

    socket = proxyquire('../../sockets/changeHandle.socket.js', {
      '../room.controller': {
        changeHandle,
      },
      '../../../utils/utils': {
        messageFactory: sinon.stub().returns(),
      },
      '../../../utils/socketFloodProtect': sinon.stub().returns(Promise.resolve()),
    });
  });

  it('should emit a `handleChange` event to client', (done) => {
    const emit = (msg, body) => {
      if (msg === 'client::handleChange') {
        expect(body).to.eql({ handle: 'bar' });
        return done();
      }

      throw new Error('wrong socket message');
    };
    const controller = socket(socketMock(emit), ioMock());
    controller({ handle: 'bar' });
  });

  it('should emit a `handleChange` event to room', (done) => {
    const emit = (msg, body) => {
      if (msg === 'room::handleChange') {
        expect(body).to.eql({ handle: 'bar', userId: '123' });
        done();
      }
    };
    const controller = socket(socketMock(), ioMock(emit));
    controller({ handle: 'bar' });
  });

  it('should emit a `status` event to room', (done) => {
    const emit = (msg, body) => {
      if (msg === 'room::status') {
        done();
      }
    };
    const controller = socket(socketMock(), ioMock(emit));
    controller({ handle: 'bar' });
  });
});
