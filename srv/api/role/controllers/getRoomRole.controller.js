const roleUtils = require('../role.utils');

module.exports = async function getRoleController(body) {
  const {
    tag,
    roleId,
    roomId,
  } = body;

  if (roleId) {
    try {
      const role = await roleUtils.getRoleById(roleId);
      return role;
    } catch (err) {
      throw err;
    }
  }

  try {
    const role = await roleUtils.getRoleByTag(roomId, tag);
    return role;
  } catch (err) {
    throw err;
  }
};
