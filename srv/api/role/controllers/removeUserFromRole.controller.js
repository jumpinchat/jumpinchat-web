const log = require('../../../utils/logger.util')({ name: 'removeUserFromRole.controller' });
const enrolledModel = require('../enrolled.model');
const { NotFoundError } = require('../../../utils/error.util');
const {
  getRoomById,
  filterClientUser,
  filterRoomUser,
} = require('../../room/room.utils');
const {
  getSocketIo,
  getUserHasRolePermissions,
  getEnrollmentById,
} = require('../role.utils');
const utils = require('../../../utils/utils');

module.exports = async function removeUserFromRole(body) {
  const {
    enrollingUser,
    enrollmentId,
    roomName,
  } = body;

  try {
    await getUserHasRolePermissions(roomName, { userId: enrollingUser }, 'assignRoles');
  } catch (err) {
    throw err;
  }

  let room;
  let enrollment;

  try {
    enrollment = await getEnrollmentById(enrollmentId);
  } catch (err) {
    throw err;
  }

  if (!enrollment) {
    throw new NotFoundError('Enrollment not found');
  }

  try {
    room = await getRoomById(enrollment.room);
  } catch (err) {
    throw err;
  }

  if (!room) {
    throw new NotFoundError(`Room "${roomName}" not found`);
  }

  const io = getSocketIo();

  try {
    room.users = room.users.map((user) => {
      if (user.username === enrollment.user.username) {
        user.roles = user.roles.filter(r => r !== enrollment.role.tag);
        return user;
      }

      return user;
    });

    await room.save();
  } catch (err) {
    throw err;
  }

  try {
    await enrolledModel.deleteOne({ _id: enrollmentId }).exec();
  } catch (err) {
    throw err;
  }

  const targetUser = room.toObject().users
    .find(user => user.username === enrollment.user.username);

  if (targetUser) {
    io.to(targetUser.socket_id).emit('self::user', {
      user: filterClientUser(targetUser),
    });

    io.to(room.name).emit('room::updateUserList', {
      user: filterRoomUser(targetUser),
    });

    io.to(targetUser.socket_id).emit('room::status', utils.messageFactory({
      message: `You were removed from the "${enrollment.role.name}" role`,
    }));

    log.debug({ socketId: targetUser });
  }

  return io.to(roomName).emit('enrollment::update');
};
