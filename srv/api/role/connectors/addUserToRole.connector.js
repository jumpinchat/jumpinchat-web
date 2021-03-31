const log = require('../../../utils/logger.util')({ name: 'addUserToRole.connector' });
const errors = require('../../../config/constants/errors');
const { NotFoundError, PermissionError } = require('../../../utils/error.util');
const addUserToRole = require('../controllers/addUserToRole.controller');

module.exports = async function addUserToRoleConnector(req, res) {
  const {
    roomName,
    roleId,
    userListId,
    userId,
  } = req.body;

  try {
    const enrollment = await addUserToRole({
      roomName,
      roleId,
      userListId,
      userId,
      enrollingUser: req.user._id,
    });

    return res.status(201).send(enrollment);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).send(err.message);
    }

    if (err instanceof PermissionError) {
      return res.status(403).send(err.message);
    }

    log.fatal({ err }, 'failed to get role');
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
