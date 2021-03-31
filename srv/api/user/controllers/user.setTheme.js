const Joi = require('joi');
const log = require('../../../utils/logger.util')({ name: 'setPlay.controller' });
const userUtils = require('../user.utils');

module.exports = async function setTheme(req, res) {
  const querySchema = Joi.object().keys({
    dark: Joi.boolean().required(),
  });

  const paramsSchema = Joi.object().keys({
    userId: Joi.string().required(),
  });

  try {
    const { value: { dark } } = await Joi.validate(req.query, querySchema);
    const { value: { userId } } = await Joi.validate(req.params, paramsSchema);

    log.debug({ userId: req.params });
    return userUtils.getUserById(userId, (err, user) => {
      if (err) {
        log.fatal({ err });
        return res.status(500).send();
      }

      if (!user) {
        log.error({ userId }, 'user not found');
        return res.status(404).send({
          error: 'ERR_NO_USER',
          message: 'user not found',
        });
      }

      user.settings.darkTheme = dark;

      user.save((err) => {
        if (err) {
          log.fatal({ err });
          return res.status(500).send();
        }

        return res.status(200).send({ darkTheme: dark });
      });
    });
  } catch (err) {
    log.fatal({ err });
    return res.status(500).send();
  }
};
