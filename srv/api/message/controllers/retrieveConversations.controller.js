const messageUtils = require('../message.utils');
const config = require('../../../config/env');
const log = require('../../../utils/logger.util')({ name: 'message.utils' });
const errors = require('../../../config/constants/errors');

module.exports = async function retrieveConversations(req, res) {
  const { userId } = req.params;
  const { page } = req.query;
  const countPerPage = config.admin.userList.itemsPerPage;
  const start = ((page - 1) * countPerPage);

  try {
    const conversations = await messageUtils.getConversationsFromCache(userId, page);
    if (conversations) {
      log.info('got conversations from cache');
      return res.status(200).send(conversations);
    }
  } catch (err) {
    log.fatal({ err }, 'error retrieving conversations');
    return res.status(500).send(errors.ERR_SRV);
  }

  try {
    const conversations = await messageUtils.getConversations(userId, start, countPerPage);

    if (!conversations) {
      return res.status(200).send([]);
    }

    const unreadQueries = conversations
      .filter(({ participants }) => participants.length === 2)
      .map(({ participants }) => {
        const participant = participants.find(p => String(p._id) !== String(userId));
        return messageUtils.getConversationUnread(userId, participant._id);
      });

    const unreadCounts = await Promise.all(unreadQueries);
    const totalConvoCount = await messageUtils.getConversationCount(userId);

    const convoWithUnread = conversations
      .map((conversation, index) => {
        let count = 0;
        let unread = 0;
        const unreadCountItem = unreadCounts[index];

        if (unreadCountItem) {
          ([count, unread] = unreadCountItem);
        }


        const participant = conversation.participants.find(p => String(p._id) !== String(userId));

        return {
          ...conversation,
          participant,
          unread,
          count,
        };
      })
      .filter(c => c.count > 0);


    const conversationsWithTotal = {
      conversations: convoWithUnread,
      count: totalConvoCount,
    };

    try {
      await messageUtils.setConversationsInCache(userId, conversationsWithTotal, page);
    } catch (err) {
      log.fatal({ err }, 'failed to set conversations in cache');
    }

    return res.status(200).send(conversationsWithTotal);
  } catch (err) {
    log.fatal({ err }, 'error retrieving conversations');
    return res.status(500).send(errors.ERR_SRV);
  }
};
