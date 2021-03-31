const log = require('../../../utils/logger.util')({ name: 'admin.addSiteMod' });
const errors = require('../../../config/constants/errors');
const adminUtils = require('../admin.utils');
const userUtils = require('../../user/user.utils');
const metaSendMessage = require('../../message/utils/metaSendMessage.util');
const { SITEMOD_ADDED } = require('../../message/message.constants');
const trophyUtils = require('../../trophy/trophy.utils');

module.exports = async function addSiteMod(req, res) {
  const { user } = req;
  const { username } = req.body;
  const userLevel = 20;

  let targetUser;

  try {
    targetUser = await userUtils.getUserByName(username);
  } catch (err) {
    log.fatal({ err }, 'failed to get user');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (!targetUser) {
    log.error({ username }, 'user does not exist');
    return res.status(404).send(errors.ERR_NO_USER);
  }

  if (!targetUser.auth.email_is_verified) {
    log.error({ username }, 'user does not have a verified email');
    return res.status(403).send({ message: 'User does not have a verified email' });
  }

  let siteMod;
  try {
    const siteModObject = {
      addedBy: user._id,
      user: targetUser._id,
      userLevel,
    };

    siteMod = await adminUtils.addSiteMod(siteModObject);
  } catch (err) {
    log.fatal({ err }, 'failed to add site mod');
    return res.status(500).send(err);
  }

  targetUser.attrs.userLevel = userLevel;

  try {
    await targetUser.save();
  } catch (err) {
    log.fatal({ err }, 'failed to save user');
    return res.status(500).send(errors.ERR_SRV);
  }


  trophyUtils.applyTrophy(targetUser._id, 'TROPHY_SITE_MOD', (err) => {
    if (err) {
      log.fatal({ err }, 'failed to apply trophy');
      return;
    }

    log.debug('applied trophy');
  });

  try {
    await metaSendMessage(targetUser._id, SITEMOD_ADDED);
  } catch (err) {
    log.fatal({ err }, 'failed to send message');
  }

  return res.status(201).send(siteMod);
};
