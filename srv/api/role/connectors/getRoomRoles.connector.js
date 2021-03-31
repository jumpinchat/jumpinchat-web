const log = require('../../../utils/logger.util')({ name: 'getRoomRoles.connector' });
const errors = require('../../../config/constants/errors');
const getRoomRoles = require('../controllers/getRoomRoles.controller');
const { getRoomIdFromName } = require('../../room/room.utils');

module.exports = async function getRoomRolesConnector(req, res) {
  const { roomName } = req.params;
  let roomId;


  try {
    roomId = await getRoomIdFromName(roomName);
  } catch (err) {
    return res.status(500).send(errors.ERR_SRV.message);
  }

  if (!roomId) {
    return res.status(400).send(errors.ERR_NO_ROOM.message);
  }

  try {
    const roles = await getRoomRoles(roomId._id);

    return res.status(200).send(roles);
  } catch (err) {
    log.fatal({ err }, 'failed to get room roles');
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
