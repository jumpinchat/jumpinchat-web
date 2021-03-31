/**
 * Created by Zaccary on 19/10/2015.
 */

const RoomUtils = require('../room.utils');
const redis = require('../../../lib/redis.util')();
const log = require('../../../utils/logger.util')({ name: 'room.changeHandle' });
const errors = require('../../../config/constants/errors');

module.exports = function changeHandle(socketId, newHandle, cb) {
  let oldHandle;
  let userId;
  const re = /^[a-zA-Z0-9_\-|[\]]+$/;

  const newHandleTrimmed = newHandle.trim();

  if (newHandleTrimmed.length > 16) {
    return cb({
      error: 'ERR_HANDLE_LENGTH',
      message: 'Nickname is too long',
    });
  }

  if (newHandleTrimmed.length < 1) {
    return cb({
      error: 'ERR_NO_HANDLE',
      message: 'Can\'t have an empty nickname',
    });
  }

  if (!newHandleTrimmed.match(re)) {
    return cb({
      error: 'ERR_HANDLE_VALIDATION',
      message: 'Nickname has invalid characters. It can contain: letters, numbers, - _ | [  ]',
    });
  }

  // get room name via socket id stored in redis
  return redis.hgetall(socketId, (err, roomData) => {
    if (err) {
      return cb(err);
    }

    if (!roomData) {
      log.error({ socketId }, 'no user session info found');
      return cb({
        error: 'ERR_NO_USER_SESSION',
        message: 'User session is invalid, you need to refresh',
      });
    }

    // get the room user is active in
    return RoomUtils.getRoomByName(roomData.name, (err, room) => {
      if (err) {
        log.fatal({ err }, 'error getting room');
        return cb(err);
      }

      if (!room) {
        log.error({
          room: roomData.name,
        }, 'tried to change handle in a room that doesn\'t exists');
        return cb({
          error: 'ERR_NO_ROOM',
          message: 'Room doesn\'t exist',
        });
      }

      // check for duplicate handles
      const duplicateHandles = room.users.filter(user => user.handle === newHandleTrimmed);

      if (duplicateHandles.length) {
        return cb({
          error: 'ERR_HANDLE_EXISTS',
          message: `${newHandleTrimmed} already in use`,
        });
      }

      room.users = room.users.map((u) => {
        if (u.socket_id === socketId) {
          oldHandle = u.handle;
          userId = u._id;
          return Object.assign(u, {
            handle: newHandleTrimmed,
          });
        }

        return u;
      });

      return room.save((err, savedRoom) => {
        if (err) {
          log.fatal({ err }, 'failed to save room');
          return cb(err);
        }

        redis.hmset(socketId, { handle: newHandleTrimmed }, async (err) => {
          if (err) {
            log.fatal({ err }, 'failed to set handle in redis');
            return cb(err);
          }

          const savedUser = savedRoom.users.find(u => u.socket_id === socketId);

          if (!savedUser) {
            log.error('could not find updated user');
            return cb(errors.ERR_NO_USER);
          }

          try {
            const historyEntry = await RoomUtils.getHistoryEntryByUserListId(savedUser._id);
            if (historyEntry) {
              historyEntry.user.handle = newHandleTrimmed;

              await historyEntry.save();
            }
          } catch (err) {
            log.fatal({ err }, 'failed to update history entry');
          }

          return cb(null, {
            uuid: userId,
            oldHandle,
            newHandle: newHandleTrimmed,
            room: roomData.name,
            user: savedUser,
          });
        });
      });
    });
  });
};
