const log = require('../../../utils/logger.util')({ name: 'getRoomRoles.controller' });
const roleUtils = require('../role.utils');

module.exports = async function getRolesController(roomId) {
  log.debug({ roomId }, 'getRolesController');
  return roleUtils.getAllRoomRoles(roomId);
};
