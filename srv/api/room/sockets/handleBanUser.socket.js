/**
 * Created by Zaccary on 24/05/2016.
 */

const log = require('../../../utils/logger.util')({ name: 'handleBanUser.socket' });
const utils = require('../../../utils/utils');
const { PermissionError } = require('../../../utils/error.util');
const roomController = require('../room.controller');
const RoomUtils = require('../room.utils');

module.exports = function handleBanUserSocket(socket, io) {
  /**
   *
   * @param {object} msg
   * @param {string} msg.room
   * @param {string} msg.user_list_id
   */
  return async function handleBanUser(msg) {
    let socketData;
    try {
      socketData = await RoomUtils.getSocketCacheInfo(socket.id);
    } catch (err) {
      log.fatal({ err }, 'failed to get socket cache info')
      return socket.emit('client::error', {
        context: 'banner',
        error: 'ERR_SRV',
        message: 'Server error',
      });
    }

    return roomController.banUser(socket, socketData.name, msg.user_list_id, msg.duration, async (err, bannedUser) => {
      if (err) {
        if (err instanceof PermissionError) {
          return socket.emit('client::error', {
            context: 'banner',
            error: err.name,
            message: err.message,
          });
        }

        switch (err) {
          case 'ERR_SELF_BAN':
            return socket.emit('client::error', {
              context: 'banner',
              error: err,
              message: 'You can not ban yourself',
            });
          case 'ERR_BAN_OWNER':
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'You can not ban the room owner',
            }));
          case 'ERR_BAN_PERM_OP':
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'You can not ban a moderator',
            }));
          case 'ERR_BAN_ADMIN':
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'You can not ban an admin',
            }));
          case 'ERR_BAN_SITE_MOD':
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'You can not ban a site moderator',
            }));

          case 'ERR_NO_USER':
            return socket.emit('client::error', utils.messageFactory({
              context: 'chat',
              message: 'User is no longer in the room',
            }));
          default:
            return socket.emit('client::error', {
              context: 'banner',
              error: err,
              message: 'error banning user',
            });
        }
      }

      io.to(socketData.name).emit('room::status', utils.messageFactory({
        message: `${bannedUser.handle} was banned by ${socketData.handle}`,
      }));

      io.to(socketData.name).emit('room::userbanned', {
        user: bannedUser,
      });

      io.to(bannedUser.socket_id).emit('self::banned');

      try {
        await utils.destroySocketConnection(io, bannedUser.socket_id);
        log.debug({
          socketId: bannedUser.socket_id,
          sessionId: bannedUser.sessionId,
          room: socketData.name,
          bannedById: socketData.userListId,
        }, 'user banned');
      } catch (err) {
        log.fatal({
          err,
          socket: bannedUser.socket_id,
        }, 'error disconnecting socket');
      }
    });
  };
};
