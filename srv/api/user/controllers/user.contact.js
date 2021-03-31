const uuid = require('node-uuid');
const log = require('../../../utils/logger.util')({ name: 'user.verifyEmail' });
const email = require('../../../config/email.config');

module.exports = function contactForm(req, res) {
  const {
    message,
    email: from,
    option,
    name,
  } = req.body;

  email.sendMail({
    to: 'contact@example.com',
    from: 'no-reply@jumpin.chat',
    replyTo: `${name ? `${name} ` : ''}${from}`,
    subject: `${option}: ${uuid.v4()}`,
    text: message,
  }, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to send contact form email');
      return res.status(500).send();
    }

    return res.status(200).send();
  });
};
