const messageUtils = require('../message.utils');
const log = require('../../../utils/logger.util')({ name: 'markAllRead' });
const errors = require('../../../config/constants/errors');

module.exports = async function markAllRead(req, res) {
  const userId = req.user._id;

  try {
    const result = await messageUtils.setMessagesRead(userId);
    log.debug({ result }, 'messages marked read');
    return res.status(200).send();
  } catch (err) {
    log.fatal({ err }, 'failed to set messages read');
    return res.status(500).end();
  }
};
