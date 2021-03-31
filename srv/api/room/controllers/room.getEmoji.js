const moment = require('moment');
const roomEmojiModel = require('../roomEmoji.model');
const { getRoomByName } = require('../room.utils');
const { getUserById } = require('../../user/user.utils');
const log = require('../../../utils/logger.util')({ name: 'getEmoji' });
const errors = require('../../../config/constants/errors');

module.exports = async function getEmoji(req, res) {
  const { roomName } = req.params;

  try {
    const room = await getRoomByName(roomName);

    if (!room) {
      log.error({ roomName }, 'room does not exists');
      return res.status(404).send();
    }

    if (!room.attrs.owner) {
      return res.status(200).send([]);
    }

    const owner = await getUserById(room.attrs.owner, { lean: true });

    if (!owner) {
      return res.status(404).send();
    }


    const supportExpired = moment(owner.attrs.supportExpires).isBefore(moment());
    if (!owner.attrs.isGold && supportExpired) {
      return res.status(200).send([]);
    }


    const emoji = await roomEmojiModel
      .find({ room: room._id })
      .populate({
        path: 'addedBy',
        select: [
          'username',
          'profile.pic',
        ],
      })
      .exec();

    return res.status(200).send(emoji);
  } catch (err) {
    log.fatal({ err }, 'failed to fetch room emoji');
    return res.status(500).send(errors.ERR_SRV);
  }
};
