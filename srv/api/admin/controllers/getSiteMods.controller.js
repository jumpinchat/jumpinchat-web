const log = require('../../../utils/logger.util')({ name: 'admin.getSiteMods' });
const errors = require('../../../config/constants/errors');
const adminUtils = require('../admin.utils');

module.exports = async function getSiteMods(req, res) {
  try {
    const siteMods = await adminUtils.getSiteMods();

    return res.status(200).send(siteMods);
  } catch (err) {
    log.fatal({ err }, 'failed to get site mods');
    return res.status(500).send(errors.ERR_SRV);
  }
};
