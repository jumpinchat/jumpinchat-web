/**
 * Created by Zaccary on 24/05/2016.
 */

const moment = require('moment');
const log = require('../../../utils/logger.util')({ name: 'handleMessage.socket' });
const RoomUtils = require('../room.utils');
const utils = require('../../../utils/utils');
const socketFloodProtect = require('../../../utils/socketFloodProtect');
const sendPush = require('../utils/room.utils.sendPush');

module.exports = function handleMessageSocket(socket, io) {
  return async function handleMessage(msg) {
    try {
      await socketFloodProtect(socket);
    } catch (err) {
      log.error({ err }, 'socket flood failed');
      return socket.emit('client::error', utils.messageFactory({
        context: 'chat',
        message: err.message || 'An unexpected server error occurred',
        error: err.name,
      }));
    }

    if (!msg.message || typeof msg.message !== 'string') {
      return socket.emit('client::error', utils.messageFactory({
        context: 'chat',
        message: 'Can not send empty message',
        error: 'ERR_NO_MESSAGE',
      }));
    }

    return RoomUtils.getSocketCacheInfo(socket.id, async (err, data) => {
      if (err) {
        log.error({ err }, 'error getting session data');
        return socket.emit('client::error', utils.messageFactory({
          context: 'chat',
          message: 'no session, try refreshing',
          error: 'ENOSESSION',
        }));
      }

      if (!data) {
        log.error('missing session data');
        return socket.emit('client::error', utils.messageFactory({
          context: 'chat',
          message: 'no session, try refreshing',
          error: 'ENOSESSION',
        }));
      }

      if (data.disconnected === 'true') {
        return socket.emit('client::error', utils.messageFactory({
          context: 'chat',
          message: 'no session, try refreshing',
          error: 'ENOSESSION',
        }));
      }

      const {
        name: roomName,
        handle,
        color,
        userListId,
      } = data;

      try {
        const userSilencedTtl = await RoomUtils.checkUserSilenced(data.userListId);

        if (userSilencedTtl) {
          return socket.emit('client::error', utils.messageFactory({
            context: 'chat',
            message: `You are silenced, wait ${moment.duration(userSilencedTtl).humanize()}`,
            error: 'ERR_SRV',
          }));
        }

        io.in(roomName).clients((err, clients) => {
          if (err) {
            log.fatal({ err }, 'error fetching socket room clients');
            return;
          }

          clients
            .filter(c => c !== socket.id)
            .forEach(clientSocket => sendPush(msg.message.substring(0, 255), data, clientSocket));
        });

        const message = utils.messageFactory({
          handle,
          color,
          userId: userListId,
          message: msg.message.substring(0, 255),
        });

        return io.to(roomName).emit('room::message', message);
      } catch (err) {
        log.fatal({ err }, 'error checking if user is silenced');
        return socket.emit('client::error', utils.messageFactory({
          context: 'chat',
          message: 'error sending message',
          error: 'ERR_SRV',
        }));
      }
    });
  };
};
