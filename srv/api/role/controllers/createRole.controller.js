const log = require('../../../utils/logger.util')({ name: 'createRole.controller' });
const roleModel = require('../role.model');
const roleUtils = require('../role.utils');
const {
  ValidationError,
} = require('../../../utils/error.util');
const { getRoomByName } = require('../../room/room.utils');

module.exports = async function createRoleController(body) {
  const {
    name,
    roomName,
    permanent,
    isDefault,
    permissions,
    icon,
    userId,
    order,
  } = body;

  let { tag } = body;

  let room;

  if (!name || name.trim().length === 0) {
    throw new ValidationError('Role name can not be empty');
  }

  if (name.length > 64) {
    throw new ValidationError('Role name can not be longer than 64 characters');
  }

  if (tag && tag.length > 32) {
    throw new ValidationError('Tag can not be longer than 32 characters');
  }

  if (tag && !roleUtils.validateTag(tag)) {
    return new ValidationError('Tag can only contain letters, numbers and underscores');
  }

  if (!roomName) {
    throw new ValidationError('Room name is missing');
  }

  try {
    room = await getRoomByName(roomName);
  } catch (err) {
    log.fatal({ err, roomName }, 'failed to get room ID from name');
    throw err;
  }

  if (!room) {
    throw new Error(`Room "${roomName}" could not be found`);
  }

  // only check permissions if user ID supplied
  // if none present, assume it's an internal request
  if (userId) {
    try {
      await roleUtils.getUserHasRolePermissions(roomName, { userId }, 'manageRoles');
    } catch (err) {
      throw err;
    }
  }

  if (!tag) {
    tag = name.trim().toLowerCase().replace(/\s/g, '_');
  }

  try {
    const roles = await roleUtils.getAllRoomRoles(room._id);
    const roleTagExists = roles.some(r => r.tag === tag);
    if (roleTagExists) {
      throw new ValidationError('Role with this tag already exists');
    }
  } catch (err) {
    throw err;
  }

  const role = {
    name,
    tag,
    roomId: room._id,
    createdBy: room.attrs.owner,
    permanent,
    permissions,
    icon,
    isDefault,
    order,
  };


  let createdRole;

  try {
    createdRole = await roleModel.create(role);
    log.debug({ createdRole, roomName }, 'created new role');
  } catch (err) {
    throw err;
  }

  const io = roleUtils.getSocketIo();
  io.to(roomName).emit('roles::update');

  return createdRole;
};
