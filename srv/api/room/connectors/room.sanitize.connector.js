const roomSanitize = require('../controllers/room.sanitize');

module.exports = function roomSanitizeConnector(req, res) {
  const { roomName } = req.params;

  return roomSanitize(roomName, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    return res.status(204).send();
  });
};
