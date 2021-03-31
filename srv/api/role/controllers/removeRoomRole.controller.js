const log = require('../../../utils/logger.util')({ name: 'removeRoomRole.controller' });
const roleUtils = require('../role.utils');
const roleModel = require('../role.model');
const {
  getRoomByName,
  filterRoomUser,
} = require('../../room/room.utils');
const {
  PermissionError,
  ValidationError,
  NotFoundError,
} = require('../../../utils/error.util');

module.exports = async function removeRoomRole(body) {
  const {
    roomName,
    roleId,
    userId,
  } = body;

  if (!roleId) {
    throw new ValidationError('role ID missing');
  }

  // check user has permissions to update role

  let room;

  try {
    room = await getRoomByName(roomName);
  } catch (err) {
    log.fatal({ err, roomName }, 'failed to get room');
    throw err;
  }

  if (!room) {
    throw new Error(`Room "${roomName}" could not be found`);
  }

  const userIsOwner = String(userId) === String(room.attrs.owner);

  // get user enrollments
  // check if user enrollments include permission to manage roles

  let hasRolePermissions;
  try {
    const enrollments = await roleUtils.getUserEnrollments({
      user: userId,
      room: room._id,
    });
    hasRolePermissions = enrollments.some(({ role }) => role.permissions.manageRoles);
  } catch (err) {
    log.fatal({ err }, 'failed to check user enrollments');
  }

  if (!userIsOwner && !hasRolePermissions) {
    throw new PermissionError('You do not have permission to do this');
  }

  let role;
  try {
    role = await roleUtils.getRoleById(roleId);
  } catch (err) {
    throw err;
  }

  if (!role) {
    return new NotFoundError('Role does not exist');
  }

  // remove user enrollments
  try {
    await roleUtils.removeRoleEnrollments(roleId);
  } catch (err) {
    log.fatal({ err, roleId }, 'failed to remove enrollments');
    throw err;
  }

  // remove role
  try {
    await roleModel.deleteOne({ _id: roleId }).exec();
  } catch (err) {
    throw err;
  }

  room.users = room.users.map(u => ({
    ...u.toObject(),
    roles: u.roles.filter(r => r !== role.tag),
  }));

  const io = roleUtils.getSocketIo();
  try {
    const savedRoom = await room.save();
    io.to(roomName).emit('roles::update');
    log.debug('saved room user list with updated roles');
    const filteredUserList = savedRoom.users.map(u => filterRoomUser(u));
    savedRoom.users.forEach(u => io.to(u.socket_id).emit('room::updateUsers', {
      users: filteredUserList,
    }));
  } catch (err) {
    throw err;
  }

  return true;
};
