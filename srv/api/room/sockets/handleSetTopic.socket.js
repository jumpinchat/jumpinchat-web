const log = require('../../../utils/logger.util')({ name: 'handleSetTopic.socket' });
const {
  getRoomByName,
  getSocketCacheInfo,
} = require('../room.utils');
const errors = require('../../../config/constants/errors');
const { PermissionError } = require('../../../utils/error.util');
const utils = require('../../../utils/utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');

module.exports = function handleSetTopicSocket(socket, io) {
  return async function setTopic({ userListId, roomName, topic }) {
    let socketData;
    try {
      socketData = await getSocketCacheInfo(socket.id);
    } catch (err) {
      return socket.emit('client::error', utils.messageFactory({
        context: 'chat',
        message: 'Server error',
      }));
    }

    try {
      await getUserHasRolePermissions(socketData.name, { userId: socketData.userId }, 'roomDetails');
    } catch (err) {
      if (err instanceof PermissionError) {
        return socket.emit('client::error', {
          context: 'banner',
          error: err.name,
          message: err.message,
        });
      }

      log.fatal({ err }, 'failed get role permissions');
      return socket.emit('client::error', {
        context: 'banner',
        error: err,
        message: 'Server error attempting to set topic.',
      });
    }

    try {
      const room = await getRoomByName(roomName);
      const user = room.users.find(u => String(u._id) === userListId);

      room.settings.topic = {
        text: topic,
        updatedAt: new Date(),
        updatedBy: user.user_id,
      };

      await room.save();

      const topicMessages = [
        ' ',
        `${user.username} updated the room topic:`,
        topic,
      ];

      return topicMessages
        .forEach(message => io
          .to(room.name)
          .emit('room::status', utils.messageFactory({ message })));
    } catch (err) {
      log.fatal({ err }, 'failed to get room');
      return socket.emit('client::error', {
        context: 'alert',
        ...errors.ERR_SRV,
      });
    }
  };
};
