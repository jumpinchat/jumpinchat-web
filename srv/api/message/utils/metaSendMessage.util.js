const log = require('../../../utils/logger.util')({ name: 'metaSendMessage.util' });
const messageUtils = require('../message.utils');
const userUtils = require('../../user/user.utils');
const errors = require('../../../config/constants/errors');

module.exports = function metaSendMessage(userId, message) {
  return new Promise(async (resolve, reject) => {
    let sender;

    if (!userId) {
      return reject(new Error('User ID missing'));
    }

    if (!message || message.length === 0) {
      return reject(new Error('Message is required'));
    }

    try {
      sender = await userUtils.getUserByName('jumpinchat', { lean: true });
    } catch (err) {
      log.fatal({ err }, 'failed to get meta user');
      return reject(err);
    }

    if (!sender) {
      log.fatal('meta user not found');
      return reject(errors.ERR_NO_USER);
    }


    let conversation;

    try {
      conversation = await messageUtils.getConversation(sender._id, userId);
    } catch (err) {
      log.fatal({ err }, 'failed to fetch conversation');
      return reject(err);
    }

    if (!conversation) {
      log.debug('conversation does not exist, creating');
      try {
        conversation = await messageUtils.addConversation([sender._id, userId]);
      } catch (err) {
        log.fatal({ err }, 'failed to create conversation');
        return reject(err);
      }
    }


    try {
      const user = await userUtils.getUserById(userId, { lean: true });

      const newMessage = await messageUtils.addMessage(
        conversation._id,
        sender._id,
        user._id,
        message,
      );

      try {
        conversation.latestMessage = new Date();
        conversation.archived = conversation.archived.map(archived => ({
          participant: archived.participant,
          isArchived: false,
        }));
        await conversation.save();
      } catch (err) {
        log.fatal({ err }, 'failed to update conversation');
      }

      return resolve(newMessage);
    } catch (err) {
      log.error({ err }, 'validation error');
      return reject(errors.ERR_VALIDATION);
    }
  });
};
