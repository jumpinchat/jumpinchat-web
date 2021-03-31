const log = require('../../../utils/logger.util')({ name: 'getJanusToken' });
const config = require('../../../config/env');
const janusUtil = require('../../../lib/janus.util');

module.exports = function getJanusToken(req, res) {
  return res.status(200).send({ token: janusUtil.getJanusToken() });
};
