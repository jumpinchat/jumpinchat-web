/**
 * Created by Zaccary on 28/05/2016.
 */

const jwt = require('jsonwebtoken');
const log = require('../../../utils/logger.util')({ name: 'handleBanUser.socket' });
const utils = require('../../../utils/utils');
const roomController = require('../room.controller');
const RoomUtils = require('../room.utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');

module.exports = function handleUnbanUser(socket, io) {
  /**
   *
   * @param {object} msg
   * @param {string} msg.room
   * @param {string} msg.banlistId
   */
  return async function handleUnBanUser(msg) {
    let socketData;
    try {
      socketData = await RoomUtils.getSocketCacheInfo(socket.id);
    } catch (err) {
      throw err;
    }


    const ip = utils.getIpFromSocket(socket);
    const sessionId = jwt.decode(socket.handshake.query.token).session;

    try {
      const ident = { userId: socketData.userId, ip, sessionId };
      await getUserHasRolePermissions(socketData.name, ident, 'ban');
    } catch (err) {
      return socket.emit('client::error', {
        context: 'modal',
        modal: 'banlist',
        message: err.message,
        error: err.error,
      });
    }

    const roomName = socketData.name;
    const { banlistId } = msg;
    const bannedUserHandle = msg.handle;

    return roomController.unbanUser(roomName, banlistId, (err, banlist) => {
      if (err) {
        log.error({ err }, 'failed to unban user');
        return socket.emit('client::error', {
          context: 'modal',
          modal: 'banlist',
          message: err.message,
          error: err.error,
        });
      }

      socket.emit('room::status', utils.messageFactory({
        message: `You unbanned ${bannedUserHandle}`,
      }));

      return socket.emit('client::banlist', {
        list: banlist,
      });
    });
  };
};
