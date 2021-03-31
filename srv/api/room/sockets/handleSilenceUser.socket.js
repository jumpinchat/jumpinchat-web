const jwt = require('jsonwebtoken');
const {
  getSocketCacheInfo,
  getRoomByName,
} = require('../room.utils');
const { PermissionError, NotFoundError } = require('../../../utils/error.util');
const redisUtils = require('../../../utils/redis.util');
const log = require('../../../utils/logger.util')({ name: 'handleSilenceUser.socket' });
const utils = require('../../../utils/utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');
const config = require('../../../config/env');

module.exports = function handleSilenceUserSocket(socket, io) {
  return async function handleSilenceUser({ user_list_id: targetUserListId }) {
    let socketData;
    try {
      socketData = await getSocketCacheInfo(socket.id);
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
      await getUserHasRolePermissions(socketData.name, ident, 'muteUserChat');
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


    const { name: roomName } = socketData;
    const { users } = await getRoomByName(roomName);
    const targetUser = users.find(({ _id }) => String(_id) === targetUserListId);

    if (!targetUser) {
      log.error({ targetUserListId, roomName }, 'target user not found');
      return socket.emit('client::error', {
        context: 'alert',
        error: NotFoundError.name,
        message: 'target user not found',
      });
    }

    if (targetUser.isAdmin) {
      return socket.emit('client::error', {
        context: 'banner',
        error: PermissionError.name,
        message: 'You can not silence an admin',
      });
    }

    if (targetUser.isSiteMod) {
      return socket.emit('client::error', {
        context: 'banner',
        error: PermissionError.name,
        message: 'You can not silence a site moderator',
      });
    }

    const silencedCacheKey = `userSilence:${targetUserListId}`;

    try {
      await redisUtils.callPromise('set', silencedCacheKey, true);
    } catch (err) {
      log.fatal({ err }, 'error pushing room data into redis');
      return socket.emit('client::error', {
        context: 'alert',
        error: err,
        message: 'error silencing user',
      });
    }

    try {
      await redisUtils.callPromise('expire', silencedCacheKey, config.room.defaultSilenceTimeout);
    } catch (err) {
      log.fatal({ err }, 'error pushing room data into redis');
      return socket.emit('client::error', {
        context: 'alert',
        error: err,
        message: 'error silencing user',
      });
    }


    io.to(targetUser.socket_id).emit('room::status', utils.messageFactory({
      message: `You have been silenced by ${socketData.handle}`,
    }));

    return io
      .to(roomName)
      .emit('room::status', utils.messageFactory({
        message: `${targetUser.handle} was silenced by ${socketData.handle}`,
      }));
  };
};
