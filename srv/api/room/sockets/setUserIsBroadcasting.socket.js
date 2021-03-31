const log = require('../../../utils/logger.util')({ name: 'setUserIsBroadcasting.socket' });
const RoomUtils = require('../room.utils');

module.exports = function setUserIsBroadcastingSocket(socket, io) {
  return function setUserIsBroadcasting(msg) {
    log.debug({ message: msg }, 'setUserIsBroadcasting');
    const getRoomNameBySocketId = () => Object.keys(socket.rooms).find(room => room !== socket.id);

    RoomUtils.getRoomByName(getRoomNameBySocketId(), (err, room) => {
      if (err) {
        log.error({ err }, 'error getting room name');
        return socket.emit(
          'client::error',
          {
            context: 'banner',
            message: 'Issues occurred during broadcast',
          },
        );
      }

      if (!room) {
        log.error({ room: msg.room }, 'unable to find room');
        return socket.emit(
          'client::error',
          {
            context: 'banner',
            message: 'Issues occurred during broadcast',
          },
        );
      }

      room.users = room.users
        .map((user) => {
          if (user.socket_id === socket.id) {
            user.isBroadcasting = msg.isBroadcasting;
          }

          return user;
        });

      return room.save((saveErr, savedRoom) => {
        if (saveErr) {
          log.fatal({ saveErr }, 'error saving room');
          return;
        }

        const updatedUser = RoomUtils
          .filterRoomUser(savedRoom.users.find(u => u.socket_id === socket.id));

        log.info({
          handle: updatedUser.handle,
          room: savedRoom.name,
          broadcasting: msg.isBroadcasting,
        }, 'user changed broadcasting state');

        io.to(savedRoom.name).emit('room::updateUser', {
          user: updatedUser,
        });
      });
    });
  };
};
