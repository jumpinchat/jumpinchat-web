const { EventEmitter } = require('events');
const log = require('./logger.util')({ name: 'queue.util' });

class Queue extends EventEmitter {
  constructor(func, interval = 1000) {
    super();
    this.queue = [];
    this.poller = null;
    this.func = func;
    this.interval = interval;
  }

  get length() {
    return this.queue.length;
  }

  /**
   * add a set of arguments to the queue
   *
   * @param {Array} args - array of arguments for the designated function
   */
  addToQueue(args) {
    this.queue = [
      ...this.queue,
      args,
    ];

    // start the poller when items are added to the queue
    if (!this.poller) {
      this.poll();
    }
  }

  async runQueue() {
    log.debug({ length: this.queue.length }, 'runQueue');
    if (this.queue.length) {
      log.debug({ length: this.queue.length }, 'queue running');
      const args = this.queue.pop();

      if (this.func.constructor === Promise) {
        try {
          await this.func.call(null, ...args);
        } catch (err) {
          return this.emit('error', err);
        }
      } else {
        this.func.call(null, ...args);
      }
    } else {
      // stop the poller if the queue is empty
      this.poller = clearInterval(this.poller);
      return this.emit('done');
    }
  }

  poll() {
    this.poller = setInterval(() => {
      log.debug('running queue');
      this.runQueue();
    }, this.interval);
  }
}

module.exports = Queue;
