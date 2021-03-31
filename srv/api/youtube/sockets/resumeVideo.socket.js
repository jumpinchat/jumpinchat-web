const log = require('../../../utils/logger.util')({ name: 'resumeVideo.socket' });
const utils = require('../../../utils/utils');
const roomUtils = require('../../room/room.utils');
const { playVideo } = require('../controllers/playVideo.controller');

module.exports = function playYoutubeVideoSocket(socket, io) {
  return function playYoutubeVideo(msg) {
    return utils.getSocketRooms(io, socket.id, (err, room) => {
      if (err) {
        return socket.emit(
          'client::error',
          {
            timestamp: new Date(),
            context: 'chat',
            message: 'Error pausing Youtube video',
          },
        );
      }

      return roomUtils.getSocketCacheInfo(socket.id, (err, data) => {
        if (err) {
          log.error({ err }, 'Error getting socket cache info');
          return socket.emit(
            'client::error',
            {
              timestamp: new Date(),
              context: 'chat',
              message: 'Error pausing Youtube video',
            },
          );
        }

        return playVideo.resume(room, socket.id, (err, videoDetails) => {
          if (err) {
            if (err === 'ERR_NO_PERMISSION') {
              return socket.emit(
                'client::error',
                {
                  timestamp: new Date(),
                  context: 'chat',
                  message: 'Only a moderator can control a video',
                },
              );
            }

            return socket.emit(
              'client::error',
              {
                timestamp: new Date(),
                context: 'chat',
                message: 'Error pausing Youtube video',
              },
            );
          }

          io.to(room).emit(
            'youtube::videoResume',
            videoDetails,
          );

          io.to(room).emit(
            'room::status',
            utils.messageFactory({
              message: `${data.handle} resumed the video`,
            }),
          );
        });
      });
    });
  };
};
