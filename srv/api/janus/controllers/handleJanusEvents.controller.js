const redisUtils = require('../../../utils/redis.util');
const log = require('../../../utils/logger.util')({ name: 'janusEventHandler' });
const { getUserByListId } = require('../../room/room.utils');

async function handleSetJanusSession(sessionId, userListId) {
  let socketId;
  try {
    const user = await getUserByListId(userListId);
    if (user) {
      socketId = user.socket_id;
    }
  } catch (err) {
    log.fatal({ err, userListId }, 'failed to get user from list ID');
  }

  if (socketId) {
    try {
      await redisUtils.callPromise('hmset', socketId, { janusSessionId: sessionId });
      await redisUtils.callPromise('expire', socketId, 60 * 60 * 24);
    } catch (err) {
      log.fatal({ err }, 'failed to get user cache');
    }
  }
}

function handleEvent(eventWrapper) {
  log.info({ event: eventWrapper }, 'janus event');
  const { session_id: sessionId, event } = eventWrapper;

  if (!event.data) {
    return;
  }

  switch (event.data.event) {
    case 'joined': {
      const {
        data: {
          display: userListId,
        },
      } = event;

      handleSetJanusSession(sessionId, userListId);

      break;
    }
    default:
  }
}

module.exports = function handleJanusEvents(req, res) {
  const { body } = req;

  if (Array.isArray(body)) {
    body.forEach(handleEvent);
  }

  res.status(200).send();
};
