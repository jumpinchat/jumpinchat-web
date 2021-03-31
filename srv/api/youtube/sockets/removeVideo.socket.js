const log = require('../../../utils/logger.util')({ name: 'removeVideo.socket' });
const utils = require('../../../utils/utils');
const { getMediaByRoomId } = require('../playlist.utils');
const roomUtils = require('../../room/room.utils');
const { playVideo } = require('../controllers/playVideo.controller');

module.exports = function removeVideoSocket(socket, io) {
  return function removeVideo({ id }) {
    roomUtils.getSocketCacheInfo(socket.id, async (err, data) => {
      if (err) {
        log.fatal({ err }, 'Error getting socket cache info');
        return socket.emit(
          'client::error',
          utils.messageFactory({
            timestamp: new Date(),
            context: 'chat',
            message: 'Error removing Youtube video',
          }),
        );
      }

      if (!data) {
        log.error('Socket data missing');
        return socket.emit(
          'client::error',
          utils.messageFactory({
            timestamp: new Date(),
            context: 'chat',
            message: 'Error removing Youtube video',
          }),
        );
      }

      const roomName = data.name;

      playVideo.removeFromPlaylist(id, roomName, async (err, removedItem) => {
        if (err) {
          log.fatal({ err }, 'Error getting socket cache info');
          return socket.emit(
            'client::error',
            utils.messageFactory({
              timestamp: new Date(),
              context: 'chat',
              message: 'Error removing Youtube video',
            }),
          );
        }

        if (!removedItem) {
          log.warn('Can not remove non-existing media');
          return socket.emit(
            'client::error',
            utils.messageFactory({
              timestamp: new Date(),
              context: 'chat',
              message: 'Media no longer exists in playlist',
            }),
          );
        }

        const roomId = await roomUtils.getRoomIdFromName(roomName);
        const { media } = await getMediaByRoomId(roomId);

        io.to(roomName).emit(
          'youtube::playlistUpdate',
          media,
        );

        io.to(roomName).emit(
          'room::status',
          utils.messageFactory({
            message: `${data.handle} removed a video from the playlist: ${removedItem.title}`,
          }),
        );
      });
    });
  };
};
