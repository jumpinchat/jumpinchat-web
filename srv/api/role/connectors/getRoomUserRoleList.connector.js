const log = require('../../../utils/logger.util')({ name: 'getRoomRole.connector' });
const errors = require('../../../config/constants/errors');
const { NotFoundError } = require('../../../utils/error.util');
const getRoomUserRoleList = require('../controllers/getRoomUserRoleList');

module.exports = async function getRoomRolesConnector(req, res) {
  const { roomName } = req.params;

  try {
    const roles = await getRoomUserRoleList({ roomName });

    return res.status(200).send(roles);
  } catch (err) {
    if (err.name === NotFoundError.name) {
      return res.status(404).send(err.message);
    }

    log.fatal({ err }, 'failed to get role');
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
