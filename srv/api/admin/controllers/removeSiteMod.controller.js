const log = require('../../../utils/logger.util')({ name: 'admin.removeSiteMod' });
const errors = require('../../../config/constants/errors');
const adminUtils = require('../admin.utils');
const userUtils = require('../../user/user.utils');
const trophyUtils = require('../../trophy/trophy.utils');

module.exports = async function removeSiteMod(req, res) {
  const { modId } = req.params;

  let mod;

  try {
    mod = await adminUtils.getSiteModById(modId);
  } catch (err) {
    log.fatal({ err }, 'failed to fetch site mod');
    return res.status(500).send(errors.ERR_SRV);
  }

  try {
    await trophyUtils.removeTrophy(mod.user, 'TROPHY_SITE_MOD');
  } catch (err) {
    log.fatal({ err }, 'failed to remove site mod trophy');
    return res.status(500).send(errors.ERR_SRV);
  }

  try {
    await adminUtils.removeSiteMod(modId);
  } catch (err) {
    log.fatal({ err }, 'failed to remove site mod');
    return res.status(500).send(errors.ERR_SRV);
  }

  return res.status(204).send();
};
