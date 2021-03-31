const log = require('../../../utils/logger.util')({ name: 'removeUserFromRole.connector' });
const removeUserFromRole = require('../controllers/removeUserFromRole.controller');
const errors = require('../../../config/constants/errors');
const { NotFoundError, PermissionError } = require('../../../utils/error.util');

module.exports = async function removeUserFromRoleConnector(req, res) {
  const { enrollmentId, roomName } = req.params;

  try {
    await removeUserFromRole({
      enrollmentId,
      roomName,
      enrollingUser: req.user._id,
    });

    return res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).send(err.message);
    }

    if (err instanceof PermissionError) {
      return res.status(403).send(err.message);
    }

    log.fatal({ err }, 'failed to remove user from role');
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
