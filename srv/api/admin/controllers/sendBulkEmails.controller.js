const marked = require('marked');
const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger.util')({ name: 'sendBulkEmails.controller' });
const Queue = require('../../../utils/queue.util');
const userUtils = require('../../user/user.utils');
const email = require('../../../config/email.config');
const config = require('../../../config/env');
const { senders, customEmail } = require('../../../config/constants/emailTemplates');

module.exports = function sendBulkEmails(req, res) {
  if (!req.body.message) {
    return res.status(400).send({
      code: 'ERR_NO_BODY',
      message: 'message is required',
    });
  }

  if (!req.body.subject) {
    return res.status(400).send({
      code: 'ERR_NO_BODY',
      message: 'subject is required',
    });
  }

  const emailBody = marked(req.body.message);
  const emailSubject = req.body.subject;

  return userUtils.getAllUsersNoPaginate((err, users) => {
    if (err) {
      log.fatal({ err }, 'Error getting all users');
      return res.status(500).end();
    }

    const verifiedEmails = users
      .filter(u => u.auth && u.auth.email_is_verified && u.settings.receiveUpdates)
      .map(u => ({
        email: u.auth.email,
        username: u.username,
        id: u._id,
      }));

    const queue = new Queue(email.sendMail, 100);

    queue.on('done', () => {
      log.debug('email send queue complete');
    });

    verifiedEmails
      .map(e => ({
        email: e.email,
        username: e.username,
        message: emailBody,
        id: e.id,
      }))
      .map(e => ({
        to: e.email,
        from: senders.admin,
        subject: emailSubject,
        html: customEmail({
          username: e.username,
          message: e.message,
          unsubToken: jwt.sign({ id: e.id }, config.auth.jwt_secret),
        }),
      }))
      .forEach((e) => {
        const cb = (err) => {
          if (err) {
            log.error({ err, username: e.username, email: e.email }, 'error sending email');
            return;
          }

          log.debug({ username: e.username, email: e.email }, 'sent email');
        };

        const args = [e, cb];
        queue.addToQueue(args);
      });

    return res.status(204).send();
  });
};
