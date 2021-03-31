const { NotFoundError, PermissionError } = require('../../../utils/error.util');
const { getUserHasRolePermissions } = require('../role.utils');

module.exports = async function getUserHasPermissionsConnector(req, res) {
  // /api/role/permission/:userId/room/:roomId?permission=
  const {
    userId,
    roomName,
  } = req.params;

  const {
    permission,
  } = req.query;


  try {
    await getUserHasRolePermissions(roomName, { userId }, permission);

    return res.status(200).send();
  } catch (err) {
    if (err.name === NotFoundError.name) {
      return res.status(404).send(err.message);
    }

    if (err.name === PermissionError.name) {
      return res.status(403).send(err.message);
    }

    return res.status(500).send(err.message);
  }
};
