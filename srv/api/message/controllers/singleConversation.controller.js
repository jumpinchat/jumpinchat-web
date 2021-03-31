const messageUtils = require('../message.utils');
const log = require('../../../utils/logger.util')({ name: 'message.utils' });
const errors = require('../../../config/constants/errors');
const { getUserById } = require('../../user/user.utils');

module.exports = async function singleConversation(req, res) {
  const { userId, participantId } = req.params;
  const { page = 1, cache = 1 } = req.query;

  if (cache === 1) {
    try {
      const conversation = await messageUtils.getConversationFromCache(userId, participantId, page);
      if (conversation) {
        log.info('got conversations from cache');
        return res.status(200).send(conversation);
      }
    } catch (err) {
      log.fatal({ err }, 'error retrieving conversations');
      return res.status(500).send(errors.ERR_SRV);
    }
  }

  let participant;
  try {
    participant = await getUserById(participantId, { lean: false });
  } catch (err) {
    return res.status(500).send(errors.ERR_SRV);
  }


  try {
    const conversation = await messageUtils.getSingleConversation(userId, participantId, page);

    if (!conversation) {
      try {
        return res.status(200).send({
          messages: [],
          latestMessage: null,
          count: 0,
          unread: 0,
          participant,
        });
      } catch (err) {
        log.fatal({ err }, 'failed to get participant user');
        return res.status(500).send(errors.ERR_SRV);
      }
    }

    try {
      const [count, unread] = await messageUtils.getConversationUnread(userId, participantId);

      await messageUtils.setConversationInCache(userId, participantId, conversation, page);

      return res.status(200).send({
        participant,
        messages: conversation.reverse(),
        unread,
        count,
      });
    } catch (err) {
      log.fatal({ err }, 'error retrieving conversation counts');
      return res.status(500).send(errors.ERR_SRV);
    }
  } catch (err) {
    log.fatal({ err }, 'error retrieving conversation');
    return res.status(500).send(errors.ERR_SRV);
  }
};
