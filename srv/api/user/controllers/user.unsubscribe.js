const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger.util')({ name: 'user.remove' });
const config = require('../../../config/env');
const userUtils = require('../user.utils');

module.exports = function unsubscribe(req, res) {
  return jwt.verify(req.params.token, config.auth.jwt_secret, (err, { id }) => {
    if (err) {
      log.error({ err }, 'invalid token');
      return res.status(401).send('Invalid token');
    }

    return userUtils.getUserById(id, (err, user) => {
      if (err) {
        log.fatal({ err, id }, 'failed to get user');
        return res.status(500).send();
      }

      user.settings.receiveUpdates = false;
      return user.save((err) => {
        if (err) {
          log.fatal({ err, id }, 'failed to save user');
          return res.status(500).send();
        }

        return res.status(200).send('Successfully unsubscribed from email updates');
      });
    });
  });
};
