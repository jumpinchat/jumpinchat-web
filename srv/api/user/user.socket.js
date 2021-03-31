let _io = null;

module.exports.getIo = function getIo() {
  return _io;
};

module.exports.register = function register(socket, io) {
  _io = io;
};
