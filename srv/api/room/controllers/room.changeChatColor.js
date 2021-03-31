/**
 * Created by Zaccary on 20/10/2015.
 */

const log = require('../../../utils/logger.util')({ name: 'changeChatColor' });
const redis = require('../../../lib/redis.util')();
const RoomUtils = require('../room.utils');
const config = require('../../../config/env');

module.exports = function changeColor(socketId, color, cb) {
  let alteredUser = null;
  let newColor;

  // get room name via socket id stored in redis
  redis.hgetall(socketId, (err, roomData) => {
    if (err) {
      return cb(err);
    }

    if (!roomData) {
      log.error('socket data missing');
      return cb({
        error: 'ERR_NO_USER_SESSION',
        message: 'User session does not exist',
      });
    }

    if (color) {
      if (!config.chatcolors.includes(color)) {
        log.error({ color }, 'invalid color choice');
        return cb({
          error: 'ERR_COLOR_INVALID',
          message: 'invalid color',
        });
      }
      newColor = color;
    } else {
      newColor = RoomUtils.getChatColor(roomData.color);
    }

    // set user chat colour in redis
    redis.hmset(socketId, { color: newColor }, (err) => {
      if (err) {
        return cb(err);
      }
    });

    // set user chat colour in the room document
    RoomUtils.getRoomByName(roomData.name, (err, room) => {
      if (err) {
        return cb(err);
      }

      if (!room) {
        return cb({
          error: 'ERR_NO_ROOM',
          message: 'room doesn\'t exist',
        });
      }

      room.users = room.users.map((user) => {
        if (socketId === user.socket_id) {
          user.color = newColor;
          alteredUser = user;
        }

        return user;
      });

      room.save((err) => {
        if (err) {
          log.error('error saving new user color', err);
        }
      });

      cb(null, {
        user: RoomUtils.filterRoomUser(alteredUser),
        room: roomData.name,
        color: newColor,
      });
    });
  });
};
