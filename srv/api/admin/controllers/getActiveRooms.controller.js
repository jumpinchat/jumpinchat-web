/**
 * Created by Zaccary on 24/07/2016.
 */

const log = require('../../../utils/logger.util')({ name: 'getActiveRooms.controller' });
const config = require('../../../config/env');
const roomUtils = require('../../room/room.utils');

module.exports = async function getActiveRooms(req, res) {
  log.info('attempting to get room list');
  const { page } = req.query;
  const countPerPage = config.admin.userList.itemsPerPage;
  const start = ((page - 1) * countPerPage);

  const count = await roomUtils.getActiveRoomCount();

  roomUtils.getActiveRooms(start, countPerPage, false, (err, rooms) => {
    if (err) {
      log.fatal({ err }, 'failed to get room list');
      return res.status(500).send(err);
    }

    return res.status(200).send({
      count,
      rooms,
    });
  });
};
