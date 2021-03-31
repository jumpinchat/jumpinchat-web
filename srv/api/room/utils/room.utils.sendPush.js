const webPush = require('web-push');
const uuid = require('uuid');
const RoomUtils = require('../room.utils');
const config = require('../../../config/env');
const log = require('../../../utils/logger.util')({ name: 'sendPush' });
const { escapeRegExp } = require('lodash');

function push(endpoint, TTL, p256dh, auth, payload) {
  if (!endpoint) {
    log.error('push endpoint missing');
    return;
  }

  const {
    publicKey,
    privateKey,
    gcmAPIKey,
  } = config.push;

  const subscription = {
    endpoint,
    TTL,
    keys: {
      p256dh,
      auth,
    },
  };

  const options = {
    vapidDetails: {
      subject: 'mailto:contact@example.com',
      publicKey,
      privateKey,
    },
    gcmAPIKey,
  };

  webPush.sendNotification(subscription, payload, options)
    .then(() => log.info('push notification sent'))
    .catch(err => log.error({ err }, 'failed to send push notification'));
}

module.exports = function sendPush(message, senderData, recipientSocketId, options = {}) {
  RoomUtils.getSocketCacheInfo(recipientSocketId, (err, pushData) => {
    if (err) {
      log.error({ err }, 'error getting session data');
      return;
    }

    if (!pushData) {
      return;
    }

    if (!pushData.pushEndpoint) {
      return;
    }

    const id = uuid.v4();
    const mentioned = new RegExp(`@${escapeRegExp(pushData.handle)}`).test(message);
    const renotify = options.renotify || mentioned;
    const payload = JSON.stringify({
      message: message.substring(0, 255),
      handle: senderData.handle,
      room: senderData.name,
      renotify,
      context: options.context || 'message',
      id,
    });

    push(pushData.pushEndpoint, pushData.pushTTL, pushData.pushKey, pushData.pushAuth, payload);
  });
};
