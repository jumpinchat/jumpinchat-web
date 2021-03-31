/**
 * Created by Zaccary on 19/01/2016.
 */


/**
 * set a user as a temporary moderator.
 * Should only exist as a moderator either until
 * the room destruction (if a guest room) or
 * after a period of 24 hours has passed.
 *
 * Moderators can only be made temporary moderators
 * if:
 *  - they are the creator of a guest room
 *  - have been made moderator by a guest room moderator
 *  - have been made a moderator by a user room moderator
 *    with the appropriate permissions, or room owner
 *
 * @param {Object} room
 * @param {string} token
 * @param {Object} (permissions)
 * @param {Object} (assignedBy)
 * @returns {*}
 */
function setTempMod(token, permissions = null, assignedBy = null) {
  return {
    session_token: token,
    permissions,
    assignedBy,
  };
}

/**
 * Set a user as a persistent moderator.
 * Permanent moderators are set via the room settings
 * page, and as long as they remain in the list, are
 * considered moderators.
 *
 *
 * @param {Object} room
 * @param {string} userId
 * @param {Object} (permissions)
 * @returns {*}
 */
function setPermanentMod(userId, permissions = null) {
  return {
    user_id: userId,
    permissions,
  };
}

/**
 * make a user an operator in a room.
 * Operators can either be permanent operators (maintain their op status in the room until manually
 * removed) or guest operators (user that created a guest room, user that was assigned operator status
 * from a chat command by a guest moderator in a guest room, or a permanent moderator with permissions
 * in a user room)
 *
 * Room owners can not be made operators, as they have maximum permissions by default
 *
 * Function will callback with an updated moderator list on completion
 *
 * @param {object} opts options about the kind of operator to add
 * @param {string} opts.type type of moderator, "temp" or "perm"
 * @param {string} (opts.session_token) Session token from connected socket
 * @param {string} (opts.user_id) ObjectID of the user to assign (permanent mods)
 * @param {object} (opts.permissions) object with permissions to set for the operator, if needed
 * @param {string} (assignedBy) the userListId of the assigning user
 */
module.exports = function makeUserModerator(opts, assignedBy = null) {
  let permissions = null;

  if (opts.permissions) {
    permissions = opts.permissions;
  }

  switch (opts.type) {
    case 'perm':
      return setPermanentMod(opts.user_id, permissions);
    case 'temp':
      return setTempMod(opts.session_token, permissions, assignedBy);
    default:
      return null;
  }
};
