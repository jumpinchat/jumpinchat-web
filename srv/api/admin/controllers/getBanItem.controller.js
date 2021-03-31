const log = require('../../../utils/logger.util')({ name: 'admin.getBanItem' });
const { getBanlistItemById } = require('../../siteban/siteban.utils');

module.exports = async function getBanItem(req, res) {
  const { banId } = req.params;
  try {
    const item = await getBanlistItemById(banId);
    return res.status(200).send(item);
  } catch (err) {
    log.fatal({ err, banId }, 'failed to get ban list item');
    return res.status(500).send(err);
  }
};
