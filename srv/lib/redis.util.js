/**
 * Created by Zaccary on 23/09/2015.
 */

const redis = require('redis');
const url = require('url');
const config = require('../config/env');
const log = require('../utils/logger.util')({ name: 'redis.util' });

let client;

log.debug({ redisConfig: config.redis });

function connect() {
  if (config.redis) {
    log.debug('has redis config');
    const rtg = url.parse(config.redis.uri);
    client = redis.createClient(rtg.port, rtg.hostname, {});

    if (rtg.auth) {
      client.auth(rtg.auth.split(':')[1]);
    }
  } else {
    log.debug('using default redis config');
    client = redis.createClient();
  }
}

connect();

client.on('ready', () => {
  log.info('redis server ready');
});

client.on('connect', () => {
  log.info('redis server connected');
});

client.on('reconnecting', ({ delay, attempt }) => {
  log.warn({ delay, attempt }, 'redis server reconnecting');
});

client.on('error', (err) => {
  log.fatal({ err }, 'redis error');
});

client.on('end', () => {
  log.fatal('redis connection closed');
  connect();
});

module.exports = function redisUtil() {
  return client;
};
