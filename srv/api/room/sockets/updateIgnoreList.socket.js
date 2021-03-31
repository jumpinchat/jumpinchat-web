const log = require('../../../utils/logger.util')({ name: 'updateIgnoreList.socket' });
const {
  getRoomByName,
  getIgnoredUsersInRoom,
} = require('../room.utils');
const errors = require('../../../config/constants/errors');

module.exports = function updateIgnoreListSocket(socket) {
  return async function updateIgnoreList({ roomName }) {
    const { ignoreList } = socket.handshake.session;
    try {
      const room = await getRoomByName(roomName);
      return socket.emit('room::updateIgnore', {
        ignoreList: getIgnoredUsersInRoom(room, ignoreList),
      });
    } catch (err) {
      log.fatal({ err, roomName }, 'error fetching room');
      return socket.emit('client::error', {
        context: 'alert',
        ...errors.ERR_SRV,
      });
    }
  };
};
