const log = require('../../../utils/logger.util')({ name: 'getRoomUsers.socket' });
const {
  getRoomByName,
  getSocketCacheInfo,
  filterRoomUser,
} = require('../room.utils');
const utils = require('../../../utils/utils');
const errors = require('../../../config/constants/errors');

module.exports = function getRoomUsersSocket(socket) {
  return async function getRoomUsers() {
    let roomName;
    let room;
    try {
      const socketData = await getSocketCacheInfo(socket.id);
      if (!socketData) {
        return socket.emit('client::error', utils.messageFactory({
          context: 'chat',
          ...errors.ERR_NO_USER_SESSION,
        }));
      }

      roomName = socketData.name;
    } catch (err) {
      return socket.emit('client::error', utils.messageFactory({
        context: 'banner',
        ...errors.ERR_SRV,
      }));
    }

    try {
      room = await getRoomByName(roomName);
    } catch (err) {
      return socket.emit('client::error', utils.messageFactory({
        context: 'banner',
        ...errors.ERR_SRV,
      }));
    }

    if (!room) {
      return socket.emit('client::error', utils.messageFactory({
        context: 'banner',
        ...errors.ERR_NO_ROOM,
      }));
    }

    return socket.emit('room::updateUsers', {
      users: room.users.map(u => filterRoomUser(u)),
    });
  };
};
