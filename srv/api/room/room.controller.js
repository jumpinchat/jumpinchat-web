/**
 * Created by vivaldi on 08/11/2014.
 */

const roomCreate = require('./controllers/room.create');
const roomRemove = require('./controllers/room.remove');
const changeHandle = require('./controllers/room.changeHandle');
const getRoom = require('./controllers/room.getRoom');
const changeColor = require('./controllers/room.changeChatColor');
const leaveRoom = require('./controllers/room.leaveRoom');
const sanitizeRoom = require('./controllers/room.sanitize');
const banUser = require('./controllers/moderation/room.moderation.banUser');
const unbanUser = require('./controllers/moderation/room.moderation.unbanUser');
const fetchBanlist = require('./controllers/room.fetchBanlist');
const getRoomList = require('./controllers/room.getRoomList');

let _io;

module.exports.setSocketIo = function setSocketIo(io) {
  _io = io;
};

module.exports.getSocketIo = function getSocketIo() {
  return _io;
};

module.exports.changeHandle = changeHandle;
module.exports.createRoom = roomCreate;
module.exports.removeRoom = roomRemove;
module.exports.getRoom = getRoom;
module.exports.changeColor = changeColor;
module.exports.leaveRoom = leaveRoom;
module.exports.sanitizeUserList = sanitizeRoom;
module.exports.banUser = banUser;
module.exports.unbanUser = unbanUser;
module.exports.fetchBanlist = fetchBanlist;
module.exports.getRoomList = getRoomList;
