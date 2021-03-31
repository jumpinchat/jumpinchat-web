const log = require('../../../utils/logger.util')({ name: 'playVideo.socket' });
const utils = require('../../../utils/utils');
const { PermissionError } = require('../../../utils/error.util');
const roomUtils = require('../../room/room.utils');
const { getUserHasRolePermissions } = require('../../role/role.utils');
const { playVideo } = require('../controllers/playVideo.controller');

module.exports = function playYoutubeVideoSocket(socket, io) {
  return async function playYoutubeVideo(msg) {
    const roomName = Object.keys(socket.rooms).find(k => k !== socket.id);

    let data;

    try {
      data = await roomUtils.getSocketCacheInfo(socket.id);
    } catch (err) {
      log.error({ err }, 'Error getting socket cache info');
      return socket.emit('client::error', {
        timestamp: new Date(),
        context: 'chat',
        message: 'Error starting Youtube video',
      });
    }

    let room;

    try {
      room = await roomUtils.getRoomByName(roomName);
    } catch (err) {
      log.fatal({ roomName, err }, 'failed to find room');
      return socket.emit(
        'client::error',
        {
          timestamp: new Date(),
          context: 'chat',
          message: 'Error starting Youtube video',
        },
      );
    }

    if (!room) {
      log.error({ roomName }, 'failed to find room');
      return socket.emit(
        'client::error',
        {
          timestamp: new Date(),
          context: 'chat',
          message: 'Error starting Youtube video',
        },
      );
    }

    try {
      await getUserHasRolePermissions(room.name, { userId: data.userId }, 'playMedia');
    } catch (err) {
      log.fatal({ err }, 'failed to check role permissions');
      if (err instanceof PermissionError) {
        return socket.emit('client::error', {
          timestamp: new Date(),
          context: 'chat',
          message: 'You don\'t have permission to play videos',
        });
      }

      return socket.emit('client::error', {
        timestamp: new Date(),
        context: 'chat',
        message: 'Error starting Youtube video',
      });
    }


    return playVideo.addToPlaylist(msg.videoId, roomName, data.userId, (err, mediaList, videoDetails) => {
      if (err) {
        return socket.emit('client::error', {
          timestamp: new Date(),
          context: 'chat',
          message: 'Error starting Youtube video',
        });
      }

      playVideo.getMedia(data.name, videoDetails._id, (err, media) => {
        if (err) {
          return socket.emit('client::error', {
            timestamp: new Date(),
            context: 'chat',
            message: 'Error starting Youtube video',
          });
        }

        io.to(roomName).emit(
          'youtube::playlistUpdate',
          mediaList,
        );

        io.to(roomName).emit(
          'room::status',
          utils.messageFactory({
            message: `${data.handle} added a video to the playlist: ${msg.title} (https://youtu.be/${msg.videoId})`,
          }),
        );
      });
    });
  };
};
