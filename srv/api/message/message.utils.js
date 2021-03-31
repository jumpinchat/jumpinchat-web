const mongoose = require('mongoose');
const MessageModel = require('./message.model');
const ConversationModel = require('./conversation.model');
const redis = require('../../lib/redis.util')();
const log = require('../../utils/logger.util')({ name: 'message.utils' });
const errors = require('../../config/constants/errors');
const config = require('../../config/env');
const email = require('../../config/email.config');
const { getUserById } = require('../user/user.utils');
const {
  newMessageTemplate,
} = require('../../config/constants/emailTemplates');

module.exports.addConversation = function addConversation(participants) {
  const conversation = {
    participants,
    archived: participants.map(participant => ({
      isArchived: false,
      participant,
    })),
  };

  return ConversationModel.create(conversation);
};

module.exports.getConversations = async function getConversations(userId, start, limit) {
  const query = {
    participants: {
      $in: [mongoose.Types.ObjectId(userId)],
    },
    $and: [
      { 'archived.participant': mongoose.Types.ObjectId(userId) },
      { 'archived.isArchived': false },
    ],
  };

  return ConversationModel
    .find(query)
    .sort({ latestMessage: -1 })
    .skip(start)
    .limit(limit)
    .lean(true)
    .populate({
      path: 'participants',
      select: ['username', '_id', 'profile', 'attrs.userLevel'],
    })
    .exec();
};

async function getConversationId(userId, participantId) {
  const message = await MessageModel
    .findOne({
      $or: [
        {
          $and: [
            { recipient: mongoose.Types.ObjectId(userId) },
            { sender: mongoose.Types.ObjectId(participantId) },
          ],
        },
        {
          $and: [
            { recipient: mongoose.Types.ObjectId(participantId) },
            { sender: mongoose.Types.ObjectId(userId) },
          ],
        },
      ],
    })
    .exec();

  if (message) {
    return message.conversationId;
  }

  return null;
}

module.exports.getConversationId = getConversationId;

function getConversation(userId, participantId) {
  const query = {
    participants: {
      $all: [
        mongoose.Types.ObjectId(userId),
        mongoose.Types.ObjectId(participantId),
      ],
    },
  };

  return ConversationModel
    .findOne(query)
    .populate({ path: 'participants', select: ['username', '_id'] })
    .exec();
}

module.exports.getConversation = getConversation;

async function getSingleConversation(userId, participantId, page) {
  const limit = config.messages.pageSize * page;
  let conversation;

  try {
    conversation = await getConversation(userId, participantId);
  } catch (err) {
    log.fatal({ err }, 'failed to get conversation');
    throw err;
  }

  if (!conversation) {
    return null;
  }

  return MessageModel
    .find({
      $and: [
        { conversation: conversation._id },
        {
          $or: [
            {
              $and: [
                { recipient: mongoose.Types.ObjectId(userId) },
                { 'attrs.archived.recipient': false },
              ],
            },
            {
              $and: [
                { sender: mongoose.Types.ObjectId(userId) },
                { 'attrs.archived.sender': false },
              ],
            },
          ],
        },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
}
module.exports.getSingleConversation = getSingleConversation;

module.exports.getAllUnread = function getAllUnread(userId) {
  return MessageModel.countDocuments({
    recipient: userId,
    'attrs.unread': true,
  }).exec();
};

async function getConversationMessages(userId, participantId) {
  let conversation;
  try {
    conversation = await getConversation(userId, participantId);
  } catch (err) {
    throw err;
  }

  if (!conversation) {
    return [];
  }

  return MessageModel
    .find({ conversation: mongoose.Types.ObjectId(conversation._id) })
    .exec();
}

module.exports.getConversationMessages = getConversationMessages;

module.exports.getConversationUnread = async function getAllUnread(userId, participantId) {
  const query = {
    recipient: userId,
    sender: participantId,
  };
  const total = await MessageModel.countDocuments({
    $or: [
      {
        $and: [
          { recipient: mongoose.Types.ObjectId(userId) },
          { sender: mongoose.Types.ObjectId(participantId) },
          { 'attrs.archived.recipient': false },
        ],
      },
      {
        $and: [
          { recipient: mongoose.Types.ObjectId(participantId) },
          { sender: mongoose.Types.ObjectId(userId) },
          { 'attrs.archived.sender': false },
        ],
      },
    ],
  }).exec();
  const unread = await MessageModel.countDocuments({
    ...query,
    'attrs.unread': true,
  }).exec();

  return Promise.all([total, unread]);
};

module.exports.getConversationCount = async function getConversationCount(userId) {
  return ConversationModel.countDocuments({ participants: { $in: [userId] } }).exec();
};

function setInCache(key, data) {
  return new Promise((resolve, reject) => {
    try {
      const dataString = JSON.stringify(data);
      return redis.set(key, dataString, (err) => {
        if (err) {
          log.fatal({ err }, 'error setting conversations in cache');
          return reject(err);
        }

        return redis.expire(key, config.messages.cacheTimeout, (err) => {
          if (err) {
            log.fatal({ err }, 'error setting conversation in cache');
            return reject(err);
          }

          return resolve();
        });
      });
    } catch (err) {
      log.fatal({ err }, 'error stringifying conversations');
      return reject(err);
    }
  });
}

function getFromCache(key) {
  return new Promise((resolve, reject) => redis.get(key, (err, data) => {
    if (err) {
      log.fatal({ err }, 'error getting conversations from cache');
      return reject(err);
    }

    if (!data) {
      return resolve();
    }

    try {
      const serializedData = JSON.parse(data);
      return resolve(serializedData);
    } catch (err) {
      log.fatal({ err }, 'failed to parse data');
      return reject(err);
    }
  }));
}

module.exports.setConversationsInCache = function setConversationsInCache(userId, conversations, page) {
  const key = `messages:${String(userId)}:${page}`;
  return setInCache(key, conversations);
};

module.exports.setConversationInCache = function setConversationInCache(userId, recipientId, conversation, page) {
  const key = `messages:${String(userId)}:${String(recipientId)}:${page}`;
  return setInCache(key, conversation);
};

module.exports.getConversationsFromCache = function getConversationsFromCache(userId, page) {
  const key = `messages:${String(userId)}:${page}`;
  return getFromCache(key);
};

module.exports.getConversationFromCache = function getConversationsFromCache(userId, recipientId, page) {
  const key = `messages:${String(userId)}:${String(recipientId)}:${page}`;
  return getFromCache(key);
};


async function addMessage(conversationId, senderId, recipientId, message) {
  if (senderId === recipientId) {
    return false;
  }

  let sender;
  let recipient;

  try {
    const userPromises = [
      getUserById(senderId, { lean: false }),
      getUserById(recipientId, { lean: false }),
    ];

    ([sender, recipient] = await Promise.all(userPromises));
  } catch (err) {
    log.fatal({ err }, 'failed to get user objects');
    throw err;
  }

  const senderIgnored = recipient.settings.ignoreList.some(u => String(u.userId) === senderId);

  if (senderIgnored && sender.attrs.userLevel < 30) {
    const error = new Error('You can not send messages to this user');
    error.name = 'PermissionDeniedError';
    throw error;
  }

  let createdMessage;

  try {
    createdMessage = await MessageModel.create({
      conversation: conversationId,
      sender: sender._id,
      recipient: recipient._id,
      message,
    });
  } catch (err) {
    throw err;
  }

  if (recipient.auth.email_is_verified && recipient.settings.receiveMessageNotifications) {
    email.sendMail({
      to: recipient.auth.email,
      subject: 'You have a new message',
      html: newMessageTemplate({
        user: recipient,
        sender,
      }),
    }, (err, info) => {
      if (err) {
        log.fatal({ err }, 'failed to send verification email');
        return;
      }

      log.debug({ info }, 'message notification email sent');
    });
  }

  return createdMessage;
}

module.exports.addMessage = addMessage;

module.exports.getMessageById = function getMessageById(id) {
  return MessageModel
    .findOne({ _id: id })
    .populate({
      path: 'sender',
      select: ['username', '_id'],
    })
    .populate({
      path: 'recipient',
      select: ['username', '_id'],
    })
    .exec();
};

module.exports.setMessagesRead = function setMessagesRead(userId) {
  return MessageModel
    .updateMany({ recipient: userId }, { $set: { 'attrs.unread': false } })
    .exec();
};
