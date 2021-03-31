const log = require('../../../utils/logger.util')({ name: 'updateRoomRole.connector' });
const errors = require('../../../config/constants/errors');
const { ValidationError, PermissionError } = require('../../../utils/error.util');
const updateRoomRoles = require('../controllers/updateRoomRole.controller');

module.exports = async function updateRoomRolesConnector(req, res) {
  const {
    roles,
  } = req.body;

  const { roomName } = req.params;

  try {
    const savedRoles = await updateRoomRoles({
      roomName,
      userId: req.user._id,
      roles,
    });

    return res.status(201).send(savedRoles);
  } catch (err) {
    if (err instanceof ValidationError) {
      log.warn({ err });
      return res.status(400).send(err.message);
    }

    if (err instanceof PermissionError) {
      log.warn({ err });
      return res.status(403).send(err.message);
    }

    log.error({ err });
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
