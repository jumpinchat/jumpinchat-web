/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Change Color Socket', () => {
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

  beforeEach(function beforeEach() {
    this.timeout(5000);

    socket = proxyquire('../../sockets/changeColor.socket.js', {
      '../controllers/room.changeChatColor': sinon.stub().yields(null, {
        color: '#000',
        user: {},

      }),
      '../../../utils/utils': {
        messageFactory: sinon.stub().returns(),
      },
    });
  });

  it('should send an updateUser message to room', (done) => {
    const controller = socket(socketMock(), ioMock((msg) => {
      expect(msg).to.equal('room::updateUser');
      done();
    }));

    controller({ color: '#fff' });
  });

  it('should emit the user and color to room', (done) => {
    const controller = socket(socketMock(), ioMock((msg, data) => {
      expect(data).to.eql({
        user: {},
        color: '#000',
      });
      done();
    }));

    controller({ color: '#fff' });
  });

  it('should emit a room status message to user', (done) => {
    const emit = (msg) => {
      if (msg === 'room::status') {
        done();
      }
    };

    const controller = socket(socketMock(emit), ioMock());

    controller({ color: '#fff' });
  });


  it('should emit a user update to self', (done) => {
    const emit = (msg, data) => {
      if (msg === 'self::user') {
        expect(data).to.eql({
          user: {
            color: '#000',
          },
        });

        done();
      }
    };

    const controller = socket(socketMock(emit), ioMock());

    controller({ color: '#fff' });
  });
});
