/**
 * Created by Zaccary on 17/03/2017.
 */

const log = require('../../../utils/logger.util')({ name: 'room.getRoomList' });
const roomUtils = require('../../room/room.utils');
const redisUtils = require('../../../utils/redis.util');
const errors = require('../../../config/constants/errors');

const roomsCacheKey = 'roomspublic';
const countCacheKey = 'roomscount';
const ttl = 5;

async function getRoomsCacheResponse(start, end) {
  const key = `${start}:${end}:${roomsCacheKey}`;
  const response = await redisUtils.callPromise('get', key);
  return JSON.parse(response);
}

async function setRoomsCache(start, end, response) {
  const key = `${start}:${end}:${roomsCacheKey}`;

  await redisUtils.callPromise('set', key, JSON.stringify(response));
  return redisUtils.callPromise('expire', key, ttl);
}

function getCountCache() {
  return redisUtils.callPromise('get', countCacheKey);
}

async function setCountCache(count) {
  await redisUtils.callPromise('set', countCacheKey, count);
  return redisUtils.callPromise('expire', countCacheKey, ttl);
}

module.exports = async function getRoomList(req, res) {
  const { start, end } = req.query;

  try {
    const rooms = await getRoomsCacheResponse(start, end);
    const count = await getCountCache();
    if (rooms && count) {
      log.debug('got room list and count from cache');
      return res.status(200).send({
        rooms,
        count,
      });
    }
  } catch (err) {
    log.fatal({ err }, 'failed to get cache response');
    return res.status(500).send(errors.ERR_SRV);
  }

  try {
    const roomCount = await roomUtils.getActiveRoomCount(true);
    return roomUtils.getActiveRooms(Number(start), Number(end), true, async (err, rooms) => {
      if (err) {
        log.fatal({ err }, 'failed to get room list');
        return res.status(500).send(err);
      }

      const formattedRooms = rooms.map((room) => {
        const broadcastingUsers = room.users.filter(u => u.isBroadcasting === true).length;
        return Object.assign({}, room, {
          attrs: Object.assign({}, room.attrs, {
            broadcastingUsers,
          }),
        });
      });

      try {
        await setRoomsCache(start, end, formattedRooms);
        await setCountCache(roomCount);
        log.debug('set room list in cache');
      } catch (err) {
        log.fatal({ err }, 'failed to set cache response');
        return res.status(500).send(errors.ERR_SRV);
      }
      return res.status(200).send({
        rooms: formattedRooms,
        count: roomCount,
      });
    });
  } catch (err) {
    log.fatal({ err }, 'failed to get room list');
    return res.status(500).send(err);
  }
};
