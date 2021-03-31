const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger.util')({ name: 'handleCloseBroadcast.socket' });
const utils = require('../../../utils/utils');
const { PermissionError } = require('../../../utils/error.util');
const RoomUtils = require('../room.utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');
const closeBroadcast = require('../controllers/moderation/room.closeBroadcast.controller');

module.exports = function handleCloseBroadcastSocket(socket, io) {
  return async function handleCloseBroadcast(msg) {
    let socketData;
    try {
      socketData = await RoomUtils.getSocketCacheInfo(socket.id);
    } catch (err) {
      return socket.emit('client::error', {
        context: 'banner',
        error: err,
        message: 'Server error attempting to clear feed.',
      });
    }

    const ip = utils.getIpFromSocket(socket);
    const sessionId = jwt.decode(socket.handshake.query.token).session;

    try {
      const ident = {
        userId: socketData.userId,
        ip,
        sessionId,
      };
      await getUserHasRolePermissions(socketData.name, ident, 'closeCam');
    } catch (err) {
      if (err instanceof PermissionError) {
        return socket.emit('client::error', {
          context: 'banner',
          error: err.name,
          message: err.message,
        });
      }

      log.fatal({ err }, 'failed to get role permissions');
      return socket.emit('client::error', {
        context: 'banner',
        error: err,
        message: 'Server error attempting to clear feed.',
      });
    }

    return closeBroadcast(socketData.name, msg.user_list_id, (err, user) => {
      if (err) {
        return socket.emit('client::error', {
          context: 'chat',
          error: err.err,
          message: err.message,
        });
      }

      io.to(user.socket_id).emit('self::closeBroadcast');
      io.to(user.socket_id).emit('room::status', utils.messageFactory({
        message: `${socketData.handle} has closed your broadcast`,
      }));

      return io.to(socketData.name).emit('room::status',
        utils.messageFactory({
          message: `${socketData.handle} has closed ${user.handle}'s broadcast`,
        }));
    });
  };
};
