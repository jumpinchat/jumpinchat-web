const messageUtils = require('../message.utils');
const log = require('../../../utils/logger.util')({ name: 'markRead' });
const errors = require('../../../config/constants/errors');

module.exports = async function markRead(req, res) {
  const { participantId } = req.params;
  const userId = req.user._id;

  try {
    const messages = await messageUtils.getConversationMessages(userId, participantId);


    const messageQueries = messages
      .filter(m => String(m.recipient) === String(userId))
      .map((message) => {
        message.attrs.unread = false;
        return message.save();
      });

    try {
      await Promise.all(messageQueries);
      return res.status(200).send();
    } catch (err) {
      log.fatal({ err }, 'failed to save messages');
      return res.status(500).end();
    }
  } catch (err) {
    log.fatal({ err }, 'failed to get unread messages');
    return res.status(500).end();
  }
};
