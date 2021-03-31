const { getRoomByName } = require('../../room/room.utils');
const { getAllRoomEnrollments, getDefaultRoles } = require('../role.utils');
const { NotFoundError } = require('../../../utils/error.util');

module.exports = async function getRoomUserRoleList(body) {
  const { roomName } = body;

  let room;
  try {
    room = await getRoomByName(roomName);
  } catch (err) {
    throw err;
  }

  if (!room) {
    throw new NotFoundError(`Room "${roomName}" not found`);
  }

  let enrollments;

  try {
    enrollments = await getAllRoomEnrollments(room._id);
  } catch (err) {
    throw err;
  }

  let defaultRoles;
  try {
    defaultRoles = await getDefaultRoles(room._id);
  } catch (err) {
    throw err;
  }

  const formattedEnrollments = enrollments
    .filter(e => Boolean(e.user))
    .reduce((acc, enrollment) => {
      const user = acc.find(u => u.userId === enrollment.user._id);

      if (user) {
        return acc.map((u) => {
          if (u.username === enrollment.user.username) {
            return {
              ...u,
              roles: [
                ...u.roles,
                {
                  enrollmentId: enrollment._id,
                  roleId: enrollment.role._id,
                  name: enrollment.role.name,
                  tag: enrollment.role.tag,
                },
              ],
            };
          }

          return u;
        });
      }

      return [
        ...acc,
        {
          username: enrollment.user.username,
          userId: enrollment.user._id,
          roles: [
            ...defaultRoles.map(r => ({
              enrollmentId: null,
              roleId: r._id,
              tag: r.tag,
              name: r.name,
              isDefault: true,
            })),
            {
              enrollmentId: enrollment._id,
              roleId: enrollment.role._id,
              tag: enrollment.role.tag,
              name: enrollment.role.name,
            },
          ],
        },
      ];
    }, []);

  return formattedEnrollments;
};
