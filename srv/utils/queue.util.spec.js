/* global describe,it,beforeEach */

const { expect } = require('chai');
const sinon = require('sinon');
const log = require('./logger.util')({ name: 'queue.util' });

const Queue = require('./queue.util');

describe('Queue', () => {
  let queue;
  const queueFunc = sinon.spy();

  beforeEach(() => {
    queue = new Queue(queueFunc);
  });

  describe('addToQueue', () => {
    it('should add array of args', () => {
      queue.poll = sinon.spy();
      const cb = () => {};
      queue.addToQueue(['1', '2', cb]);

      expect(queue.queue).have.length(1);
      expect(queue.queue[0]).to.eql(['1', '2', cb]);
    });

    it('should start the poller if not already', () => {
      queue.poll = sinon.spy();
      queue.addToQueue(['1', '2']);

      expect(queue.poll.called).to.equal(true);
    });
  });

  describe('runQueue', () => {
    it('should clearInterval if queue is empty', () => {
      global.clearInterval = sinon.spy();
      queue.poller = 'foo';
      queue.emit = sinon.spy();

      queue.runQueue();

      expect(global.clearInterval.firstCall.args).to.eql(['foo']);
    });

    it('should emit "done" if queue is empty', () => {
      global.clearInterval = sinon.spy();
      queue.poller = 'foo';
      queue.emit = sinon.spy();

      queue.runQueue();

      expect(queue.emit.firstCall.args).to.eql(['done']);
    });

    it('should call the set function with the args', () => {
      queue.queue = [
        ['1', '2', 'cb'],
      ];

      queue.runQueue();

      expect(queueFunc.firstCall.args).to.eql([
        '1',
        '2',
        'cb',
      ]);
    });
  });
});
