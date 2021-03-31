const log = require('../../../utils/logger.util')({ name: 'getUserRoles.controller' });
const { NotFoundError } = require('../../../utils/error.util');
const { getRoomByName } = require('../../room/room.utils');
const { getUserEnrollments } = require('../role.utils');

/**
 * getUserRoles
 *
 * @param {object} body
 * @param {string} body.userListId
 * @param {string} body.roomName
 *
 * @return {array} []roles
 */
module.exports = async function getUserRoles(body) {
  const { userListId, roomName } = body;
  let room;
  let roles;

  try {
    log.debug({ getRoomByName: typeof getRoomByName });
    room = await getRoomByName(roomName);
  } catch (err) {
    throw err;
  }

  if (!room) {
    throw new NotFoundError(`Room "${roomName}" not found`);
  }

  const roomUser = room.users.find(u => userListId === String(u._id));

  if (!roomUser) {
    throw new NotFoundError('User not found in room');
  }

  try {
    const {
      userId,
      session_id: sessionId,
      ip,
    } = roomUser;

    roles = await getUserEnrollments({
      userId,
      sessionId,
      ip,
      room: room._id,
    });
  } catch (err) {
    throw err;
  }

  return roles;
};
