const log = require('../../../utils/logger.util')({ name: 'getRoomRole.connector' });
const errors = require('../../../config/constants/errors');
const getRoomRole = require('../controllers/getRoomRole.controller');
const { getRoomIdFromName } = require('../../room/room.utils');

module.exports = async function getRoomRolesConnector(req, res) {
  const { roomName, roleId } = req.params;
  const { tag } = req.query;
  let roomId;


  try {
    const result = getRoomIdFromName(roomName);

    if (!result) {
      return res.status(404).send('Room not found');
    }

    ({ _id: roomId } = result);
  } catch (err) {
    return res.status(500).send(errors.ERR_SRV.message);
  }

  try {
    const role = await getRoomRole({ roomId, tag, roleId });

    if (!role) {
      return res.status(404).send('Role not found');
    }

    return res.status(200).send(role);
  } catch (err) {
    log.fatal({ err }, 'failed to get role');
    return res.status(500).send(errors.ERR_SRV.message);
  }
};
