const RedisStore = require('rate-limit-redis');
const rateLimit = require('express-rate-limit');
const log = require('./logger.util')({ name: 'rateLimit' });
const redis = require('../lib/redis.util')();
const config = require('../config/env');

const store = new RedisStore({
  client: redis,
  expiry: config.auth.rateLimitDuration / 1000,
});

module.exports = rateLimit({
  windowMs: config.auth.rateLimitDuration,
  max: 10,
  store,
  keyGenerator: (req) => {
    let ip;

    if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for']
        .split(',')
        .map(s => s.trim())[0];
    } else {
      ip = req.connection.remoteAddress;
    }

    log.debug({ ip }, 'gen rate limit key');

    return ip;
  },
  skip: req => req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].match(/^10\./),
});
