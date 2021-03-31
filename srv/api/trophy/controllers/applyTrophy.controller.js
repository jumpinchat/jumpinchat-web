const log = require('../../../utils/logger.util')({ name: 'applyTrophy.controllers' });
const errors = require('../../../config/constants/errors');
const { applyTrophy } = require('../trophy.utils');

module.exports = function applyTrophyController(req, res) {
  const { userId } = req.params;
  const { trophyName } = req.body;

  return applyTrophy(userId, trophyName, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to apply trophy');
      return res.status(500).send(errors.ERR_SRV);
    }

    log.info({ userId }, 'trophy applied');
    return res.status(200).send();
  });
};
