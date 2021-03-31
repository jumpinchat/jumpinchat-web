const config = require('../../config/env');
const log = require('../../utils/logger.util')({ name: 'roomClose.utils' });
const RoomCloseModel = require('./roomClose.model');
const roomUtils = require('../room/room.utils');
const { getSocketIo } = require('../admin/admin.controller');

module.exports.getByRoomName = function getByRoomName(name) {
  return RoomCloseModel
    .findOne({ name })
    .where('expiresAt').gt(new Date())
    .lean(true)
    .exec();
};

function banUser(socketId) {
  const io = getSocketIo();
  return io.to(socketId).emit('self::banned');
}

module.exports.closeRoom = async function closeRoom(roomName, reason, duration) {
  try {
    const room = await roomUtils.getRoomByName(roomName);

    const users = room.users.map(u => ({
      ip: u.ip,
      sessionId: u.session_id,
      userId: u.user_id,
      handle: u.handle,
    }));


    const closeDuration = 1000 * 60 * 60 * duration || 1000 * config.siteban.defaultExpire;
    const expiresAt = new Date(Date.now() + closeDuration);

    const roomCloseData = {
      name: roomName,
      reason,
      users,
      expiresAt,
    };

    const newClose = await RoomCloseModel.create(roomCloseData);
    room.users.forEach(({ socket_id }) => banUser(socket_id));
    return newClose;
  } catch (err) {
    log.fatal({ err }, 'failed to create room closure');
    return Promise.reject(err);
  }
};
