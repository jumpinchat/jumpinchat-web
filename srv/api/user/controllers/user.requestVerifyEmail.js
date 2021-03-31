const log = require('../../../utils/logger.util')({ name: 'user.requestVerifyEmail' });
const { createEmailVerification } = require('../../verify/verify.utils');
const userUtils = require('../user.utils');

module.exports = function requestVerifyEmail(req, res) {
  if (req.body.user) {
    const { user } = req.body;

    createEmailVerification(user, (err) => {
      if (err) {
        log.fatal({ err }, 'Could not create new verification data');
        return res.status(403).send();
      }

      return res.status(200).send();
    });
  } else {
    const userId = req.signedCookies['jic.ident'];
    if (!userId) {
      log.warn('unauthorized access: no token');
      res.status(401).send('Unauthorized');
      return;
    }

    userUtils.getUserById(userId, (err, user) => {
      if (err) {
        log.fatal({ err }, 'error getting user');
        res.status(401).send('Unauthorized');
        return;
      }

      if (!user) {
        log.error({ userId }, 'user missing');
        res.status(401).send('Unauthorized');
        return;
      }

      createEmailVerification(user, (err) => {
        if (err) {
          log.error({ err }, 'Could not create new verification data');
          return res.status(403).send();
        }

        res.status(200).send();
      });
    });
  }
};
