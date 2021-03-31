const log = require('../../../utils/logger.util')({ name: 'seekVideo.socket' });
const utils = require('../../../utils/utils');
const roomUtils = require('../../room/room.utils');
const { playVideo } = require('../controllers/playVideo.controller');

function getRoomFromSocket(io, socketId) {
  return new Promise((resolve, reject) => {
    utils.getSocketRooms(io, socketId, (err, room) => {
      if (err) {
        return reject(err);
      }

      if (!room) {
        const error = new Error();
        error.name = 'NoRoomError';
        error.message = 'Room does not exist';

        return reject(error);
      }

      return resolve(room);
    });
  });
}

module.exports = function seekYoutubeVideoSocket(socket, io) {
  return async function seekYoutubeVideo(msg) {
    log.debug({ msg }, 'seek video socket');

    if (!msg.seekTo) {
      return socket.emit(
        'client::error',
        {
          timestamp: new Date(),
          context: 'chat',
          message: 'New video time not set',
        },
      );
    }

    if (Number.isNaN(msg.seekTo)) {
      return socket.emit(
        'client::error',
        {
          timestamp: new Date(),
          context: 'chat',
          message: 'Video seek time must be a number',
        },
      );
    }

    let room;

    try {
      room = await getRoomFromSocket(io, socket.id);
    } catch (err) {
      log.error({ err, socketId: socket.id }, 'Error getting room from socket');
      return socket.emit(
        'client::error',
        {
          timestamp: new Date(),
          context: 'chat',
          message: 'Error seeking YouTube video',
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
            message: 'Error seeking Youtube video',
          },
        );
      }

      return playVideo.seekTo(room, socket.id, msg.seekTo, (err, videoDetails, seekTime) => {
        if (err) {
          log.error({ err }, 'Error seeking video');
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
              message: 'Error seeking Youtube video',
            },
          );
        }

        io.to(room).emit(
          'youtube::seek',
          videoDetails,
        );

        io.to(room).emit(
          'room::status',
          utils.messageFactory({
            message: `${data.handle} changed the current video time`,
          }),
        );
      });
    });
  };
};
