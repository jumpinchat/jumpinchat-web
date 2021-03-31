/**
 * Created by vivaldi on 08/11/2014.
 */


const changeHandleSocket = require('./sockets/changeHandle.socket');
const handleMessageSocket = require('./sockets/handleMessage.socket');
const handleJoinRoomSocket = require('./sockets/handleJoinRoom.socket');
const handleDisconnectSocket = require('./sockets/handleDisconnect.socket');
const handleBanUserSocket = require('./sockets/handleBanUser.socket');
const handleuUnbanUserSocket = require('./sockets/handleUnbanUser.socket');
const fetchBanlistSocket = require('./sockets/fetchBanlist.socket');
const runCommandSocket = require('./sockets/runCommand.socket');
const setUserIsBroadcastingSocket = require('./sockets/setUserIsBroadcasting.socket');
const changeColorSocket = require('./sockets/changeColor.socket');
const handleCloseBroadcast = require('./sockets/handleCloseBroadcast.socket');
const privateMessageSocket = require('./sockets/privateMessage.socket');
const isStillJoinedSocket = require('./sockets/isStillJoined.socket');
const ignoreUserSocket = require('./sockets/ignoreUser.socket');
const unignoreUserSocket = require('./sockets/unignoreUser.socket');
const updateIgnoreListSocket = require('./sockets/updateIgnoreList.socket');
const handleSilenceUserSocket = require('./sockets/handleSilenceUser.socket');
const handleKickUserSocket = require('./sockets/handleKickUser.socket');
const setTopicSocket = require('./sockets/setTopic.socket');
const getRoomUsersSocket = require('./sockets/getRoomUsers.socket');

module.exports.register = function register(socket, io) {
  const changeHandle = changeHandleSocket(socket, io);
  const handleMessage = handleMessageSocket(socket, io);
  const handleJoinRoom = handleJoinRoomSocket(socket, io);
  const handleDisconnect = handleDisconnectSocket(socket, io);
  const handleBanUser = handleBanUserSocket(socket, io);
  const handleUnbanUser = handleuUnbanUserSocket(socket, io);
  const fetchBanlist = fetchBanlistSocket(socket, io);
  const runCommand = runCommandSocket(socket, io);
  const setUserIsBroadcasting = setUserIsBroadcastingSocket(socket, io);
  const changeColor = changeColorSocket(socket, io);
  const closeBroadcast = handleCloseBroadcast(socket, io);
  const privateMessage = privateMessageSocket(socket, io);
  const isStillJoined = isStillJoinedSocket(socket, io);
  const ignoreUser = ignoreUserSocket(socket, io);
  const unignoreUser = unignoreUserSocket(socket, io);
  const updateIgnoreList = updateIgnoreListSocket(socket, io);
  const handleSilenceUser = handleSilenceUserSocket(socket, io);
  const handleKickUser = handleKickUserSocket(socket, io);
  const setTopic = setTopicSocket(socket, io);
  const getRoomUsers = getRoomUsersSocket(socket, io);

  socket.on('room::operation::ban', handleBanUser);
  socket.on('room::operation::unban', handleUnbanUser);
  socket.on('room::operation::banlist', fetchBanlist);
  socket.on('room::operation::silence', handleSilenceUser);
  socket.on('room::operation::kick', handleKickUser);
  socket.on('room::handleChange', changeHandle);

  /**
   * message:
   * event: the event that was called on the client
   * timestamp: the time the event was called on the client (for performance monitoring maybe)
   * payload: the actual data that is being sent, if applicable
   * browser-sig: the browser signature calling the event
   *
   */
  socket.on('room::join', handleJoinRoom);

  socket.on('disconnect', handleDisconnect);

  socket.on('room::message', handleMessage);
  socket.on('room::command', runCommand);
  socket.on('room::setUserIsBroadcasting', setUserIsBroadcasting);
  socket.on('room::changeColor', changeColor);
  socket.on('room::operation::closeBroadcast', closeBroadcast);
  socket.on('room::privateMessage', privateMessage);
  socket.on('room::isStillJoined', isStillJoined);
  socket.on('room::ignoreUser', ignoreUser);
  socket.on('room::unignoreUser', unignoreUser);
  socket.on('room::getIgnoreList', updateIgnoreList);
  socket.on('room::setTopic', setTopic);
  socket.on('room::users', getRoomUsers);
};
