const bunyan = require('bunyan');

module.exports = function createLogger(opts = {}) {
  if (!opts.name) {
    throw new Error('Logger requires a `name` parameter');
  }

  if (process.env.NODE_ENV === 'test') {
    return {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
    };
  }

  const defaultOpts = {
    level: process.env.TEST ? 100 : 'debug',
    serializers: bunyan.stdSerializers,
  };

  return bunyan.createLogger({ ...defaultOpts, ...opts });
};
