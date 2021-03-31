const log = require('../../utils/logger.util')({ name: 'playVideo.controller' });
const playVideoSocket = require('./sockets/playVideo.socket');
const pauseVideoSocket = require('./sockets/pauseVideo.socket');
const resumeVideoSocket = require('./sockets/resumeVideo.socket');
const getCurrentlyPlayingSocket = require('./sockets/getCurrentlyPlaying.socket');
const removeVideoSocket = require('./sockets/removeVideo.socket');
const seekVideoSocket = require('./sockets/seekVideo.socket');


module.exports.register = function register(socket, io) {
  const playVideo = playVideoSocket(socket, io);
  const pauseVideo = pauseVideoSocket(socket, io);
  const resumeVideo = resumeVideoSocket(socket, io);
  const getCurrentlyPlaying = getCurrentlyPlayingSocket(socket, io);
  const removeVideo = removeVideoSocket(socket, io);
  const seekVideo = seekVideoSocket(socket, io);

  socket.on('youtube::play', playVideo);
  socket.on('youtube::pause', pauseVideo);
  socket.on('youtube::resume', resumeVideo);
  socket.on('youtube::remove', removeVideo);
  socket.on('youtube::checkisplaying', getCurrentlyPlaying);
  socket.on('youtube::seek', seekVideo);
};
