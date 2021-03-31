const messageUtils = require('../message.utils');
const log = require('../../../utils/logger.util')({ name: 'archiveMessages' });
const errors = require('../../../config/constants/errors');

module.exports = async function archiveMessages(req, res) {
  const { participantId } = req.params;
  const userId = String(req.user._id);

  let conversation;

  try {
    conversation = await messageUtils.getConversation(userId, participantId);
  } catch (err) {
    log.fatal({ err }, 'failed to fetch conversation');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (!conversation) {
    log.error({ userId, participantId }, 'conversation not found');
    return res.status(404).send();
  }

  conversation.archived = conversation.archived.map((archived) => {
    const { participant } = archived;
    if (String(participant) === userId) {
      return {
        participant,
        isArchived: true,
      };
    }

    return archived;
  });

  try {
    await conversation.save();
  } catch (err) {
    log.fatal({ err }, 'failed to save conversation');
    return res.status(500).send(errors.ERR_SRV);
  }

  try {
    const messages = await messageUtils.getConversationMessages(userId, participantId);

    const messageQueries = messages
      .map((message) => {
        const participantIsSender = String(message.sender) === userId;
        if (participantIsSender) {
          message.attrs.archived.sender = true;
        } else {
          message.attrs.archived.recipient = true;
          message.attrs.unread = false;
        }

        return message.save();
      });

    try {
      const updatedMessages = await Promise.all(messageQueries);
      return res.status(200).send(updatedMessages);
    } catch (err) {
      log.fatal({ err }, 'failed to archive messages');
      return res.status(500).send(errors.ERR_SRV);
    }
  } catch (err) {
    log.fatal({ err }, 'failed to get messages');
    return res.status(500).send(errors.ERR_SRV);
  }
};
