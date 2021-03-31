/**
 * Created by Zaccary on 20/10/2015.
 */

const log = require('../../../utils/logger.util')({ name: 'room.leaveRoom' });
const redisUtil = require('../../../utils/redis.util');
const janusUtil = require('../../../lib/janus.util');
const roomUtils = require('../room.utils');
const { NotFoundError } = require('../../../utils/error.util');

module.exports = async function leaveRoom(socketId, cb) {
  let socketData;

  try {
    socketData = await redisUtil.callPromise('hgetall', socketId);
  } catch (err) {
    log.fatal({ err }, 'failed to fetch session data');
    return cb(new Error('server error'));
  }

  if (!socketData) {
    return cb(new NotFoundError('Error fetching session'));
  }

  const {
    janusServerId,
    janusSessionId,
  } = socketData;

  if (janusSessionId) {
    try {
      await janusUtil.destroySession(janusServerId, janusSessionId);
    } catch (err) {
      log.fatal({ err }, 'failed to remove janus session');
    }
  }

  const removeUserCb = async (err, user) => {
    if (err) {
      log.error({ err }, 'error removing user');
      return cb(err);
    }

    if (!user) {
      return cb(new NotFoundError('user not found'));
    }

    log.debug('removed user');

    try {
      const updatedSocketData = {
        ...socketData,
        disconnected: true,
      };
      await redisUtil.callPromise('hmset', socketId, updatedSocketData);
      await redisUtil.callPromise('expire', socketId, 60 * 60 * 10);
    } catch (err) {
      return cb(err);
    }

    log.debug({ socketId }, 'socket disconnected, setting expire on session data');
    return cb(null, socketData.name, user);
  };

  return roomUtils.addToRemoveUserQueue(socketId, socketData.name, removeUserCb);
};
