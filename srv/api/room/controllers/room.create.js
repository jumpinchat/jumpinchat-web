/**
 * Created by Zaccary on 22/09/2015.
 */

const log = require('../../../utils/logger.util')({ name: 'room.create.controller' });

const RoomModel = require('../room.model');
const roomUtils = require('../room.utils');
const createRole = require('../../role/controllers/createRole.controller');
const addUserToRole = require('../../role/controllers/addUserToRole.controller');
const { createDefaultRoles } = require('../../role/role.utils');

/**
 * Creates a room.
 *
 * Rooms initially consist of a model including a name string and optionally
 * a user that has registered it. During room creation, a Janus 'room' will also
 * be created and assigned by ID to the room model.
 *
 * If a room is created from a registered user, the room name will be that of the
 * registered user, who will be assigned owner. Otherwise, it will be a 'guest' room
 * and the name will consist of the url used to create it. For example, `site.com/awesome`
 * will create a room named 'awesome'. By default, the creator will be joined to that room
 * and will become it's moderator.
 *
 * @param {Object} room
 * @param {Object} (user)
 * @callback cb
 */
module.exports = async function createRoom(room, user, cb) {
  let roomName;
  let roomOwnerId = null;
  const roomSettings = { moderators: [] };

  if (!room.name) {
    log.fatal('trying to create a room with no name');
    return cb('ERR_NO_ROOM_NAME');
  }

  if (user) {
    roomName = user.username;
    roomOwnerId = user._id;
    roomSettings.public = false;
  } else {
    roomName = room.name;
  }

  const roomObj = {
    name: roomName,
    attrs: {
      creation_ip: room.ip,
      owner: roomOwnerId,
    },
    settings: roomSettings,
  };

  let existingRoom;

  try {
    existingRoom = await roomUtils.getRoomByName(roomName);
  } catch (err) {
    log.fatal({ err, roomName }, 'failed to get room');
    return cb(err);
  }

  if (existingRoom) {
    existingRoom.attrs.owner = roomOwnerId;
    existingRoom.settings.moderators = roomSettings.moderators;

    return existingRoom.save(cb);
  }

  let janusRoomId;
  let serverId;

  try {
    const janusData = await roomUtils.createJanusRoomAsync(roomObj.attrs.janus_id);
    ({ janusRoomId, serverId } = janusData);
  } catch (err) {
    log.fatal({ err }, 'could not create janus room');
    return cb(err);
  }

  roomObj.attrs.janusServerId = serverId;
  roomObj.attrs.janus_id = janusRoomId;

  log.debug({
    janusId: roomObj.attrs.janus_id,
    janusServerId: roomObj.attrs.janusServerId,
  }, 'created new Janus room');

  let createdRoom;
  try {
    createdRoom = await RoomModel.create(roomObj);
  } catch (err) {
    return cb(err);
  }

  const defaultRoles = createDefaultRoles(roomName);

  let createdRoles;
  const rolePromises = Object
    .values(defaultRoles)
    .map(role => createRole({ roomName, ...role }));

  try {
    createdRoles = await Promise.all(rolePromises);
    log.info({ roomName }, 'created default roles for room');
  } catch (err) {
    log.fatal({ err, roomName }, 'failed to create default roles for room');
    return cb(err);
  }

  const modRole = createdRoles.find(r => r.tag === 'mods');

  try {
    await addUserToRole({
      roomName,
      enrollingUser: roomOwnerId,
      userId: roomOwnerId,
      roleId: modRole._id,
      ident: {
        ip: room.ip,
        sessionId: room.sessionId,
      },
    });
  } catch (err) {
    log.fatal({ err }, 'failed to add user to role');
    return cb(err);
  }

  return cb(null, createdRoom);
};
