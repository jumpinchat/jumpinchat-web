/**
 * Created by Zaccary on 24/07/2016.
 */

const log = require('../../../utils/logger.util')({ name: 'getActiveRooms.controller' });
const roomUtils = require('../../room/room.utils');

module.exports = function getRoomById(req, res) {
  log.info({ roomId: req.params.roomId }, 'fetching room');
  roomUtils.getRoomById(req.params.roomId, (err, room) => {
    if (err) {
      log.fatal({ err }, 'failed to get room');
      res.status(500).send(err);
      return;
    }

    res.status(200).send(room);
  });
};
