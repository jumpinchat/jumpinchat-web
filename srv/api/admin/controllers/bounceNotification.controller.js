const log = require('../../../utils/logger.util')({ name: 'admin.bounceNotification' });
const config = require('../../../config/env');
const { getUserByEmail } = require('../../user/user.utils');
const {
  addToBlacklist,
  isSubscriptionConfirmation,
  handleSnsSubscription,
} = require('../../email/email.utils');


module.exports = function bounceNotification(req, res) {
  if (isSubscriptionConfirmation(req.headers)) {
    return handleSnsSubscription(req, res);
  }

  const message = JSON.parse(req.body.Message);
  const type = message.bounce ? 'bounce' : 'complaint';
  const recipients = message.bounce ? 'bouncedRecipients' : 'complainedRecipients';

  message[type][recipients].forEach(({ emailAddress }) => getUserByEmail(emailAddress, (err, user) => {
    if (err) {
      log.fatal({ err }, 'failed to get user by email');
      return;
    }

    if (!user) {
      log.error({ emailAddress }, 'user does not exist');
      return;
    }

    user.auth.email_is_verified = false;
    user.save(async (err) => {
      if (err) {
        log.fatal({ err }, 'failed to save user');
      }

      try {
        log.info({ emailAddress }, 'blacklisting bounced address');
        await addToBlacklist(message);
      } catch (err) {
        log.fatal({ err }, 'error adding to blacklist');
      }

      log.info({ emailAddress }, 'email unverified');
    });
  }));

  if (config.env === 'production') {
    log.info({ data: message }, `email ${type}`);
  }

  return res.status(204).send();
};
