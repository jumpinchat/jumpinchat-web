const roomEmojiModel = require('../roomEmoji.model');
const { getRoomById } = require('../room.utils');
const log = require('../../../utils/logger.util')({ name: 'removeEmoji' });
const config = require('../../../config/env');
const { s3RemoveObject } = require('../../../utils/utils');
const errors = require('../../../config/constants/errors');

module.exports = async function getEmoji(req, res) {
  const { bucket } = config.aws.s3.jicUploads;
  const {
    emojiId,
  } = req.params;
  const { user } = req;
  const userId = String(user._id);

  try {
    const emoji = await roomEmojiModel
      .findOne({ _id: emojiId })
      .exec();

    if (!emoji) {
      return res.status(404).send(errors.ERR_NOT_FOUND);
    }

    const room = await getRoomById(emoji.room);

    log.debug({
      addedBy: emoji.addedBy,
      userId,
      owner: room.attrs.owner,
    });
    if (String(emoji.addedBy) !== userId && userId !== String(room.attrs.owner)) {
      return res.status(403).send(errors.ERR_NO_PERMISSION);
    }

    return s3RemoveObject(bucket, emoji.image, async (err, data) => {
      if (err) {
        log.fatal({ err }, 'failed to remove S3 object');
        return res.status(500).send(errors.ERR_SRV);
      }

      log.info({ data }, 'removed object from S3');

      await roomEmojiModel.deleteOne({ _id: emojiId }).exec();
      return res.status(204).send();
    });
  } catch (err) {
    log.fatal({ err }, 'failed to fetch room emoji');
    return res.status(500).send(errors.ERR_SRV);
  }
};
