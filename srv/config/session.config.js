const { merge } = require('lodash');
const log = require('../utils/logger.util')({ name: 'session.config' });

module.exports.initialSession = function initialSession(session) {
  return merge({
    ageConfirmed: false,
    ignoreList: [],
  }, session);
};
