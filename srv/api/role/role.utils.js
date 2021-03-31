const roomUtils = require('../room/room.utils');
const roleModel = require('./role.model');
const { defaultRoles, tagFormat } = require('./role.consts');
const enrolledModel = require('./enrolled.model');
const { NotFoundError, PermissionError } = require('../../utils/error.util');
const log = require('../../utils/logger.util')({ name: 'role.utils' });

let _io;

module.exports.setSocketIo = function setSocketIo(io) {
  _io = io;
};

module.exports.getSocketIo = function getSocketIo() {
  return _io;
};

module.exports.getAllRoomRoles = function getRoomRoles(roomId) {
  return roleModel
    .find({ roomId })
    .sort({ order: -1 })
    .exec();
};

module.exports.getRoleById = function getRoleById(roleId) {
  return roleModel.findOne({ _id: roleId }).exec();
};

function getRoleByTag(roomId, tag) {
  if (!roomId) {
    throw new TypeError('Room ID missing');
  }

  if (!tag) {
    throw new TypeError('Tag missing');
  }

  return roleModel
    .findOne({
      $and: [
        { roomId },
        { tag },
      ],
    })
    .exec();
}

module.exports.getRoleByTag = getRoleByTag;

/**
 * Get enrollments for user in specified room
 *
 * @param {object} body
 * @param {string} body.room
 * @param {string} body.user
 * @param {string} body.ip
 * @param {string} body.sessionId
 */
function getUserEnrollments(body) {
  const {
    user,
    sessionId,
    ip,
    room,
  } = body;

  if (!room) {
    throw new TypeError('room ID missing');
  }

  let queryParams = [];

  if (ip && sessionId) {
    queryParams = [
      { 'ident.ip': ip },
      { 'ident.sessionId': sessionId },
    ];
  }

  if (user) {
    queryParams = [
      { user },
    ];
  }

  // don't call query if no valid query parameters.
  // prevents attempting query with only 'room' parameter
  // which would return all roles for room
  if (queryParams.length === 0) {
    return Promise.resolve([]);
  }

  return enrolledModel
    .find({
      $and: [
        { room },
        ...queryParams,
      ],
    })
    .populate({
      path: 'role',
      select: ['permissions', 'tag'],
    })
    .exec();
}

module.exports.getUserEnrollments = getUserEnrollments;

module.exports.getEnrollmentById = function getEnrollmentById(enrollmentId) {
  return enrolledModel
    .findOne({ _id: enrollmentId })
    .populate({
      path: 'user',
      select: ['username'],
    })
    .populate({
      path: 'role',
      select: ['name', 'tag'],
    })
    .exec();
};

module.exports.getAllRoomEnrollments = function getAllRoomEnrollments(roomId) {
  return enrolledModel.find({ room: roomId })
    .populate({
      path: 'user',
      select: ['username'],
    })
    .populate({
      path: 'role',
      select: ['name', 'tag'],
    })
    .exec();
};

function getDefaultRoles(roomId) {
  return roleModel.find({ roomId, isDefault: true }).exec();
}

module.exports.getDefaultRoles = getDefaultRoles;

module.exports.createDefaultRoles = function createDefaultRoles(roomName) {
  const everybodyRole = {
    ...defaultRoles.everybody,
    roomName,
  };

  const modRole = {
    ...defaultRoles.mods,
    roomName,
  };

  return { modRole, everybodyRole };
};

module.exports.removeRoomRoles = function removeRoomRoles(roomId) {
  return roleModel.deleteMany({ roomId }).exec();
};

module.exports.removeRoomEnrollments = function removeRoomEnrollments(roomId) {
  return enrolledModel.deleteMany({ room: roomId }).exec();
};

module.exports.removeRoleEnrollments = function getRoleEnrollments(roleId) {
  return enrolledModel.deleteMany({ role: roleId }).exec();
};

async function getUserHasRolePermissions(roomName, ident, permission) {
  if (!roomName || roomName.length === 0) {
    throw new TypeError('roomName is required');
  }

  if (!permission) {
    throw new TypeError('permission is required');
  }

  let room;
  const {
    userId,
    ip,
    sessionId,
  } = ident;
  try {
    room = await roomUtils.getRoomByName(roomName);
  } catch (err) {
    throw err;
  }

  if (!room) {
    throw new NotFoundError(`Room "${roomName}" could not be found`);
  }


  const userIsOwner = String(userId) === String(room.attrs.owner);

  // get user enrollments
  // check if user enrollments include permission to manage roles

  let hasRolePermissions;
  try {
    const defaultRoomRoles = await getDefaultRoles(room._id);
    const enrollments = await getUserEnrollments({
      ip,
      sessionId,
      user: userId,
      room: room._id,
    });

    hasRolePermissions = [
      ...defaultRoomRoles.map(r => ({ role: r })),
      ...enrollments,
    ].some(({ role }) => role.permissions[permission]);
  } catch (err) {
    log.fatal({ err }, 'failed to check user enrollments');
    throw err;
  }

  if (!userIsOwner && !hasRolePermissions) {
    throw new PermissionError(`You do not have permission to do this: ${permission}`);
  }

  return true;
}

module.exports.getUserHasRolePermissions = getUserHasRolePermissions;

module.exports.validateTag = function validateTag(tag) {
  return tagFormat.test(tag);
};
