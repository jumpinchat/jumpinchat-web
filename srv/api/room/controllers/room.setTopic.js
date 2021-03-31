const Joi = require('joi');
const {
  getRoomByName,
  getSocketCacheInfo,
} = require('../room.utils');
const { PermissionError } = require('../../../utils/error.util');
const { getUserHasRolePermissions } = require('../../role/role.utils');

const { getUserById } = require('../../user/user.utils');
const log = require('../../../utils/logger.util')({ name: 'room.setTopic' });
const errors = require('../../../config/constants/errors');

module.exports = async function submitTopic(socketId, topic) {
  let roomCache;
  let room;

  try {
    roomCache = await getSocketCacheInfo(socketId);
  } catch (err) {
    log.fatal({ err }, 'failed to get socket cache');
    const error = new Error();
    error.name = errors.ERR_SRV.code;
    error.message = errors.ERR_SRV.message;

    throw error;
  }

  if (!roomCache) {
    log.error({ socketId }, 'cache data not found');
    const error = new Error();
    error.name = errors.ERR_SRV.code;
    error.message = errors.ERR_SRV.message;

    throw error;
  }

  try {
    room = await getRoomByName(roomCache.name);
  } catch (err) {
    log.fatal({ err }, 'failed to get room');
    const error = new Error();
    error.name = errors.ERR_SRV.code;
    error.message = errors.ERR_SRV.message;
    throw error;
  }

  if (!room) {
    log.error({ room: roomCache.name }, 'room not found');
    const error = new Error();
    error.name = errors.ERR_NO_ROOM.code;
    error.message = errors.ERR_NO_ROOM.message;
    throw error;
  }
  if (!roomCache.userId) {
    log.error('no user');
    const error = new Error();
    error.name = errors.ERR_NO_USER.code;
    error.message = errors.ERR_NO_USER.message;
    throw error;
  }

  try {
    await getUserHasRolePermissions(room.name, { userId: roomCache.userId }, 'roomDetails');
  } catch (err) {
    if (err instanceof PermissionError) {
      throw err;
    }

    throw new Error(errors.ERR_SRV.message);
  }

  const schema = Joi.object().keys({
    topic: Joi.string().max(140).allow(''),
  });

  try {
    const {
      value: {
        topic: validatedTopic,
      },
    } = await Joi.validate({ topic }, schema);

    if (room.settings.topic.text !== validatedTopic.trim()) {
      room.settings.topic = {
        text: validatedTopic,
        updatedAt: new Date(),
        updatedBy: roomCache.userId,
      };
    }
  } catch (err) {
    const error = new Error();
    error.name = 'ValidationError';
    error.message = 'Topic is invalid, max 140 characters';

    throw error;
  }

  let user;

  try {
    user = await getUserById(roomCache.userId, { lean: true });
  } catch (err) {
    log.fatal({ err }, 'failed to get user');
    const error = new Error();
    error.name = errors.ERR_SRV.code;
    error.message = errors.ERR_SRV.message;

    throw error;
  }

  try {
    const savedRoom = await room.save();
    return {
      handle: roomCache.handle,
      topic: {
        ...savedRoom.settings.topic,
        updatedBy: {
          username: user ? user.username : 'unknown',
          _id: user ? user._id : null,
        },
      },
      room: roomCache.name,
    };
  } catch (err) {
    log.fatal({ err }, 'error saving room');
    const error = new Error();
    error.name = errors.ERR_SRV.code;
    error.message = errors.ERR_SRV.message;

    throw error;
  }
};
