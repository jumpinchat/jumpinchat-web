const messageUtils = require('../message.utils');
const log = require('../../../utils/logger.util')({ name: 'getUnread' });
const errors = require('../../../config/constants/errors');

module.exports = async function getUnread(req, res) {
  const { userId } = req.params;

  try {
    const unread = await messageUtils.getAllUnread(userId);
    return res.status(200).send({ unread });
  } catch (err) {
    log.fatal({ err }, 'failed to get unread messages');
    return res.status(500).end();
  }
};
