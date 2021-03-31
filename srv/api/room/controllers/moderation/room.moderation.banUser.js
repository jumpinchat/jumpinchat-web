/**
 * Created by Zaccary on 24/01/2016.
 */

const jwt = require('jsonwebtoken');
const RoomUtils = require('../../room.utils');
const log = require('../../../../utils/logger.util')({ name: 'room.moderation.banUser' });
const { createError, getIpFromSocket } = require('../../../../utils/utils');
const errors = require('../../../../config/constants/errors');
const config = require('../../../../config/env');
const { getUserHasRolePermissions } = require('../../../role/role.utils');

const getOperator = (room, userToBan) => room.settings.moderators
  .find(m => String(m._id) === String(userToBan.operator_id));

/**
 * Ban a user.
 * Banned users are added to the room's banlist, which
 * is checked whilst joining a room. Banned users will
 * not be allowed to complete the join process.
 *
 * @param {string} userSocket the socket ID of the user doing the banning
 * @param {string} roomName the name of the room to ban from
 * @param {string} userListIdToBan the ID of the user list document
 * @param {function} cb
 */
module.exports = async function banUser(socket, roomName, userListIdToBan, banDuration, cb) {
  let userId;
  try {
    const data = await RoomUtils.getSocketCacheInfo(socket.id);
    log.debug({ ...data }, 'socket data');

    ({ userId } = data);
  } catch (err) {
    throw err;
  }


  const ip = getIpFromSocket(socket);
  const sessionId = jwt.decode(socket.handshake.query.token).session;

  try {
    log.debug({ userId, ip, sessionId });
    await getUserHasRolePermissions(roomName, { userId, ip, sessionId }, 'ban');
  } catch (err) {
    log.error({ err }, 'failed to ban user');
    return cb(err);
  }

  if (banDuration > config.room.banLimit) {
    const message = `Duration can only be up to ${config.room.banLimit} hours`;
    return cb(createError('ERR_INVALID_VALUE', message));
  }

  if (banDuration < 1) {
    const message = 'Duration must be at least 1 hour';
    return cb(createError('ERR_INVALID_VALUE', message));
  }

  let room;

  try {
    room = await RoomUtils.getRoomByName(roomName);
  } catch (err) {
    log.fatal({ err }, 'error getting room');
    return cb(err);
  }

  const actingOperator = room.users.find(user => user.socket_id === socket.id);
  let userToBan = room.users.find(user => String(user._id) === userListIdToBan);
  if (!userToBan) {
    log.info('no user, attempting to find from history');
    try {
      const historyEntry = await RoomUtils.getHistoryEntryByUserListId(userListIdToBan);

      if (!historyEntry) {
        log.warn('history entry missing, can not ban user');
        return cb(errors.ERR_NO_USER);
      }

      if (!historyEntry.user || !historyEntry.user.sessionId) {
        log.warn('history entry user data missing, can not ban user');
        return cb(errors.ERR_NO_USER);
      }

      userToBan = {
        ...historyEntry.user,
        session_id: historyEntry.user.sessionId,
      };
    } catch (err) {
      log.fatal({ err }, 'failed to get room history entry');
      return cb(errors.ERR_SRV);
    }
  }

  const ipMatch = userToBan.ip === actingOperator.ip;
  const userIdMatch = userToBan.user_id
    && actingOperator.user_id
    && userToBan.user_id === actingOperator.user_id;

  if (config.env !== 'development' && (ipMatch || userIdMatch)) {
    return cb('ERR_SELF_BAN');
  }

  if (!actingOperator.isAdmin) {
    if (userToBan.user_id && String(userToBan.user_id) === String(room.attrs.owner)) {
      log.warn({ userToBan, ownerId: room.attrs.owner }, 'User attempted to ban the room owner');
      return cb('ERR_BAN_OWNER');
    }

    if (userToBan.operator_id) {
      const mod = getOperator(room, userToBan);

      if (mod && (!mod.assignedBy || String(mod.assignedBy) === String(room.attrs.owner))) {
        log.warn('User attempted to ban a permanent operator');
        return cb('ERR_BAN_PERM_OP');
      }
    }
  }

  if (userToBan.isAdmin) {
    log.warn('user attempted to ban an admin');
    return cb('ERR_BAN_ADMIN');
  }

  if (userToBan.isSiteMod) {
    log.warn('user attempted to ban a site moderator');
    return cb('ERR_BAN_SITE_MOD');
  }

  const banEntry = {
    handle: userToBan.handle,
    ip: userToBan.ip,
    signature: userToBan.signature,
    sessionId: userToBan.session_id,
    banDuration: 1000 * 60 * 60 * banDuration || config.room.banTimeout,
  };

  if (userToBan.user_id) {
    banEntry.user_id = userToBan.user_id;
  }

  const filteredBanlist = room.banlist.filter((item) => {
    const time = new Date().getTime();
    const banTimestamp = new Date(item.timestamp).getTime();
    const banInEffect = (time - banTimestamp) < item.banDuration;
    return banInEffect;
  });

  room.banlist = [...filteredBanlist, banEntry];

  return room.save((err) => {
    if (err) {
      log.fatal({ err }, 'error saving room');
      return cb(err);
    }

    return cb(null, userToBan);
  });
};
