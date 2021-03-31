const log = require('./logger.util')({ name: 'socketFloodProtect' });
const redis = require('../lib/redis.util')();
const config = require('../config/env');
const { FloodError } = require('./error.util');

function setKey(key) {
  return new Promise((resolve, reject) => {
    redis.set(key, 1, (err) => {
      if (err) {
        log.fatal({ err }, 'failed to set flood key');
        return reject(err);
      }

      // Timer to use if limit not reached.
      // Lower value, preventing rapid message spam
      return redis.expire(key, config.room.floodRefresh, (err) => {
        if (err) {
          log.fatal({ err }, 'failed to set flood key');
          return reject(err);
        }

        log.debug({ key }, 'expire set on flood key');
        return resolve();
      });
    });
  });
}

module.exports = function socketFloodProtect(socket, io) {
  return new Promise((resolve, reject) => {
    const key = `flood:${socket.id}`;
    redis.get(key, async (err, value) => {
      if (err) {
        log.fatal({ err }, 'failed to get flood key');
        return reject(err);
      }

      log.debug({ value, key }, 'socket flood protect');

      if (!value) {
        try {
          await setKey(key);
          log.info({ key }, 'new flood key set');
          return resolve();
        } catch (err) {
          return reject(err);
        }
      }

      if (Number(value) > config.room.floodLimit) {
        log.warn({ key }, 'flood limit reached');
        // Timer to use if user reaches the flood limit
        // higher value, shuts users up for a while
        return redis.expire(key, config.room.floodTimeout, (err) => {
          if (err) {
            log.fatal({ err, key }, 'failed to reset expire on flood key');
            return reject(err);
          }

          const e = new FloodError('Flood limit reached. Please enhance your calm.');
          return reject(e);
        });
      }

      return redis.incr(key, (err) => {
        if (err) {
          log.fatal({ err }, 'failed to get flood key');
          return reject(err);
        }

        log.debug({ key }, 'key value incremented');

        return resolve();
      });
    });
  });
};
