const log = require('../../../utils/logger.util')({ name: 'addUserToRole.controller' });
const { NotFoundError } = require('../../../utils/error.util');
const {
  getRoomByName,
  filterClientUser,
  filterRoomUser,
} = require('../../room/room.utils');
const {
  getSocketIo,
  getRoleById,
  getUserHasRolePermissions,
} = require('../role.utils');
const enrolledModel = require('../enrolled.model');
const utils = require('../../../utils/utils');

/**
 * addUserToRoleController
 *
 * @param {object} body
 * @param {string} body.enrollingUser - user that is adding the target to the role
 * @param {string} body.userListId - (optional) user list ID to be enrolled
 * @param {string} body.userId - (optional) user ID of user to add
 * @param {string} body.roomName
 * @param {string} body.roleId - ID of the role
 *
 * @returns {object}
 */
module.exports = async function addUserToRoleController(body) {
  log.debug('addUserToRoleController');
  const io = getSocketIo();
  const {
    enrollingUser,
    userListId,
    userId,
    roomName,
    roleId,
  } = body;

  let { ident } = body;

  let room;
  let role;

  try {
    await getUserHasRolePermissions(roomName, { userId: enrollingUser }, 'assignRoles');
  } catch (err) {
    throw err;
  }

  try {
    room = await getRoomByName(roomName);

    if (!room) {
      throw new NotFoundError(`Room "${roomName}" not found`);
    }
  } catch (err) {
    throw err;
  }

  if (userListId) {
    const roomUser = room.users.find(u => String(u._id) === userListId);

    if (!roomUser) {
      throw new NotFoundError('User not found in room');
    }

    const {
      session_id: sessionId,
      ip,
    } = roomUser;

    if (!userId) {
      ident = {
        sessionId,
        ip,
      };
    }
  }

  try {
    role = await getRoleById(roleId);

    if (!role) {
      throw new NotFoundError('Role not found');
    }
  } catch (err) {
    throw err;
  }

  const enrollment = {
    role: role._id,
    user: userId || null,
    room: room._id,
    enrolledBy: enrollingUser,
    ident,
  };

  try {
    room.users = room.users.map((user) => {
      if (String(user._id) === userListId || userId === String(user.user_id)) {
        user.roles.push(role.tag);
        return user;
      }

      return user;
    });

    await room.save();
  } catch (err) {
    throw err;
  }

  let createdEnrollment;
  try {
    createdEnrollment = await enrolledModel.create(enrollment);
  } catch (err) {
    throw err;
  }

  const targetUser = room.toObject().users
    .find(user => String(user._id) === userListId || userId === String(user.user_id));

  if (targetUser) {
    io.to(targetUser.socket_id).emit('self::user', {
      user: filterClientUser(targetUser),
    });

    io.to(targetUser.socket_id).emit('room::status', utils.messageFactory({
      message: `You were added to the "${role.name}" role`,
    }));

    io.to(room.name).emit('room::updateUserList', {
      user: filterRoomUser(targetUser),
    });
  }

  io.to(roomName).emit('enrollment::update');


  return createdEnrollment;
};
