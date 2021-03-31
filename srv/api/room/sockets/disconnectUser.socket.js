/**
 * Created by Zaccary on 24/05/2016.
 */

const log = require('../../../utils/logger.util')({ name: 'disconnectUser.socket' });
const utils = require('../../../utils/utils');
const roomController = require('../room.controller');
const RoomUtils = require('../room.utils');

module.exports = function disconnectUserSocket(socket, io) {
  return function disconnectUser() {
    log.debug('disconnect user');
    roomController.leaveRoom(socket.id, (err, roomName, user) => {
      if (err) {
        log.fatal({ err }, 'error leaving room');
        socket.emit('server::error',
          {
            context: 'banner',
            error: err,
          });
      }

      if (!user) {
        log.warn({ user, roomName }, 'can not find user to disconnect');
        return;
      }

      io.to(roomName).emit('room::status', utils.messageFactory({
        message: `${user.handle} has left the room`,
      }));

      io.to(roomName).emit('room::disconnect', {
        user: RoomUtils.filterRoomUser(user),
      });
    });
  };
};
