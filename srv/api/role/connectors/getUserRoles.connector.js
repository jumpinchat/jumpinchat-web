const log = require('../../../utils/logger.util')({ name: 'getRoomRole.connector' });
const errors = require('../../../config/constants/errors');
const { NotFoundError } = require('../../../utils/error.util');
const getUserRoles = require('../controllers/getUserRoles.controller');

module.exports = async function getUserRolesConnector(req, res) {
  const { roomName, userListId } = req.params;

  try {
    const roles = await getUserRoles({ roomName, userListId });

    return res.status(200).send(roles);
  } catch (err) {
    if (err.name === NotFoundError.name) {
      log.error({ err }, 'failed to get roles');
      return res.status(400).send(err.message);
    }

    log.fatal({ err }, 'failed to get roles');
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
