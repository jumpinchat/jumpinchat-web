const log = require('../../../utils/logger.util')({ name: 'ignoreUser.socket' });
const ignoreUserController = require('../controllers/room.ignoreUser');
const {
  getRoomByName,
  getIgnoredUsersInRoom,
} = require('../room.utils');
const errors = require('../../../config/constants/errors');
const utils = require('../../../utils/utils');

module.exports = function ignoreUserSocket(socket, io) {
  return function ignoreUser({ userListId, roomName }) {
    log.debug({ userListId, roomName }, 'ignore user');
    ignoreUserController(roomName, socket.id, userListId, async (err, ignoreData) => {
      if (err) {
        return socket.emit('client::error', {
          context: 'banner',
          ...err,
        });
      }

      const { session } = socket.handshake;

      if (!session.ignoreList.some(i => i.sessionId === ignoreData.sessionId)) {
        session.ignoreList = [
          ...session.ignoreList,
          ignoreData,
        ];

        session.save();
      }

      try {
        const room = await getRoomByName(roomName);

        const ignoredMessage = utils.messageFactory({
          timestamp: new Date(),
          message: `You have ignored ${ignoreData.handle}`,
        });

        socket.emit('room::status', ignoredMessage);

        return socket.emit('room::updateIgnore', {
          ignoreList: getIgnoredUsersInRoom(room, session.ignoreList),
        });
      } catch (err) {
        return socket.emit('client::error', {
          context: 'alert',
          ...errors.ERR_SRV,
        });
      }
    });
  };
};
