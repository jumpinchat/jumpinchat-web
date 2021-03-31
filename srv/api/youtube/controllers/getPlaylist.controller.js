const log = require('../../../utils/logger.util')({ name: 'getPlaylist.controller' });
const errors = require('../../../config/constants/errors');
const { getRoomIdFromName } = require('../../room/room.utils');
const { getMediaByRoomId } = require('../playlist.utils');

module.exports = async function getPlaylist(req, res) {
  const { roomName } = req.params;
  try {
    const roomId = await getRoomIdFromName(roomName);
    const playlist = await getMediaByRoomId(roomId);

    return res.status(200).send(playlist.media.toObject().map(m => ({
      ...m,
      startedBy: {
        userId: m.startedBy._id,
        username: m.startedBy.username,
        pic: m.startedBy.profile.pic,
      },
    })));
  } catch (err) {
    log.fatal({ err, roomName }, 'error fetching room');
    return res.status(500).send(errors.ERR_SRV);
  }
};
