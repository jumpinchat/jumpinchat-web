const log = require('../../../utils/logger.util')({ name: 'isStillJoined.socket' });
const utils = require('../../../utils/utils');
const RoomUtils = require('../room.utils');

module.exports = function isStillJoinedSocket(socket) {
  return function isStillJoined(msg) {
    const {
      room: roomName,
    } = msg;

    return RoomUtils.getRoomByName(roomName, (err, room) => {
      if (err) {
        log.fatal({ err }, 'error getting room');
        return;
      }

      if (!room) {
        log.error({ roomName }, 'Can not check connection, room has gone');
        return socket.emit(
          'client::error',
          utils.messageFactory({
            context: 'chat',
            message: 'Room no longer exists, please refresh.',
          }),
        );
      }

      const user = room.users.find(u => u.socket_id === socket.id);

      return RoomUtils.getSocketCacheInfo(socket.id, (err, socketInfo) => {
        if (err) {
          log.fatal({ err }, 'Error fetching socket cache info');
          return socket.emit(
            'client::error',
            utils.messageFactory({
              context: 'chat',
              message: 'Session no longer exists, please refresh.',
            }),
          );
        }

        if (!socketInfo || !user) {
          log.warn('User no longer connected, disconnecting');
          return socket.emit('client::forceDisconnect');
        }

        return socket.emit('client::stillConnected');
      });
    });
  };
};
