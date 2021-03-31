const log = require('../../../utils/logger.util')({ name: 'userCreateSession' });
const { getUserById } = require('../user.utils');
const videoQuality = require('../../../config/constants/videoQuality');
const errors = require('../../../config/constants/errors');

module.exports = async function setBroadcastQuality(req, res) {
  const { quality } = req.query;

  if (!videoQuality[quality]) {
    log.warn({ quality }, 'invalid quality value');
    return res.status(400).send(errors.ERR_INVALID_PARAMS);
  }

  try {
    const user = await getUserById(req.user._id, { lean: false });

    if (!user) {
      log.error({ userId: req.user._id }, 'user not found');
      return res.status(404).send(errors.ERR_NO_USER);
    }

    user.settings.videoQuality = quality;
    await user.save();
    return res.status(200).send(videoQuality[quality]);
  } catch (err) {
    log.fatal({ err }, 'failed to set video quality');
    return res.status(500).send(errors.ERR_SRV);
  }
};
