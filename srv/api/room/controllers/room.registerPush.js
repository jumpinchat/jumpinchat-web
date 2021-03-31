const redis = require('../../../lib/redis.util')();
const log = require('../../../utils/logger.util')({ name: 'room.registerPush' });

module.exports = function registerPush(req, res) {
  const { socketId } = req.params;
  const {
    endpoint,
    ttl,
    key,
    authSecret,
  } = req.body;

  const pushData = {
    pushEndpoint: endpoint,
    pushTTL: ttl,
    pushKey: key,
    pushAuth: authSecret,
  };

  redis.hmset(socketId, pushData, (err) => {
    if (err) {
      log.fatal({ err }, 'Failed to set push data');
      return res.status(500).send('ERR_SRV');
    }

    return res.status(204).send();
  });
};
