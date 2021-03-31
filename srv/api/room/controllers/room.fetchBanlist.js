/**
 * Created by Zaccary on 28/05/2016.
 */


const log = require('../../../utils/logger.util')({ name: 'room.fetchBanlist' });
const { getRoomByName } = require('../room.utils');

module.exports = async function fetchBanlist(roomName, cb) {
  let room;
  try {
    room = await getRoomByName(roomName);
  } catch (err) {
    log.error({ err }, 'failed to get room');
    return cb(err);
  }

  const filteredBanlist = room.banlist
    .map(banItem => ({
      _id: banItem._id,
      handle: banItem.handle,
      timestamp: new Date(banItem.timestamp).toISOString(),
      username: banItem.user_id && banItem.user_id.username,
    }))
    .reverse();

  return cb(null, filteredBanlist);
};
