const redis = require('../lib/redis.util')();

module.exports.callPromise = function callPromise(method, ...args) {
  return new Promise((resolve, reject) => {
    redis[method](...args, (err, ...res) => {
      if (err) {
        return reject(err);
      }

      return resolve(...res);
    });
  });
};
