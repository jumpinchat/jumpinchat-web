const log = require('../../../utils/logger.util')({ name: 'privateMessage.socket' });
const utils = require('../../../utils/utils');
const roomUtils = require('../room.utils');
const sendPush = require('../utils/room.utils.sendPush');
const privateMessageController = require('../controllers/room.privateMessage');
const socketFloodProtect = require('../../../utils/socketFloodProtect');

module.exports = function privateMessage(socket, io) {
  /**
   *
   * @param {object} msg
   * @param {string} msg.room
   * @param {string} msg.userListId
   */
  return async function privateMessageSocket(msg) {
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

    privateMessageController(msg.room, socket.id, msg.userListId, (err, socketId) => {
      if (err) {
        return socket.emit(
          'client::error',
          {
            context: 'banner',
            message: err.message,
            error: err.error,
          },
        );
      }

      return roomUtils.getSocketCacheInfo(socket.id, (err, data) => {
        if (err) {
          log.fatal({ err }, 'error getting session data');
          return socket.emit('client::error', {
            context: 'banner',
            message: 'no session, try refreshing',
            error: 'ENOSESSION',
          });
        }

        if (!data) {
          log.error('missing session data');
          return socket.emit('client::error', {
            context: 'banner',
            message: 'no session, try refreshing',
            error: 'ENOSESSION',
          });
        }


        roomUtils.setSocketIdByListId(String(msg.userListId), socketId, (err) => {
          if (err) {
            log.fatal({ err }, 'failed to set socket ID by list ID');
          }
        });

        const pushOpts = {
          renotify: true,
          context: 'pm',
        };

        sendPush(msg.message.substring(0, 255), data, socketId, pushOpts);

        const message = utils.messageFactory({
          handle: data.handle,
          color: data.color,
          userListId: data.userListId,
          userId: data.userId,
          message: msg.message.substring(0, 255),
        });

        socket.emit(
          'room::privateMessage',
          Object.assign({}, message, {
            userListId: msg.userListId,
            clientIsSender: true,
          }),
        );

        return io.to(socketId).emit(
          'room::privateMessage',
          message,
        );
      });
    });
  };
};
