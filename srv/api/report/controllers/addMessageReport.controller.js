const messageReportModel = require('../messageReport.model');
const log = require('../../../utils/logger.util')({ name: 'addMessageReport' });
const email = require('../../../config/email.config');
const { getMessageById } = require('../../message/message.utils');
const {
  messageReportTemplate,
} = require('../../../config/constants/emailTemplates');

module.exports = async function addMessageReport(req, res) {
  const {
    messageId,
    reason,
  } = req.body;

  let message;
  try {
    message = await getMessageById(messageId);

    if (!message) {
      return res.status(404).send({
        message: 'Message not found',
      });
    }
  } catch (err) {
    log.fatal({ err }, 'failed to create message report');
    return res.status(500).send();
  }

  try {
    const createdReport = await messageReportModel.create({
      reason,
      message: messageId,
    });

    log.debug({ createdReport, message });

    email.sendMail({
      to: 'contact@example.com',
      subject: `Message report: ${message.sender.username}->${message.recipient.username}`,
      html: messageReportTemplate(createdReport),
    }, (err) => {
      if (err) {
        log.fatal({ err }, 'failed to send report email');
        return;
      }

      log.info({ reportId: createdReport._id }, 'report email sent');
    });

    return res.status(201).send();
  } catch (err) {
    log.fatal({ err }, 'failed to create message report');
    return res.status(500).send();
  }
};
