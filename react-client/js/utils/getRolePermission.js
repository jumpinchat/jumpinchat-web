export default (permission, roles, userRoles) => roles
  .filter(role => userRoles.includes(role.tag))
  .some(role => role.permissions[permission]);
