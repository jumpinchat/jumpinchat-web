const Joi = require('joi');
const log = require('../../../utils/logger.util')({ name: 'user.setLayout' });
const { getUserById } = require('../user.utils');
const errors = require('../../../config/constants/errors');

module.exports = async function setLayout(req, res) {
  const schema = Joi.object().keys({
    wideLayout: Joi.boolean(),
  });

  const { user: { _id: userId } } = req;
  let wideLayout;
  try {
    const { value } = await Joi.validate(req.body, schema);
    ({ wideLayout } = value);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).send('Invalid request');
    }

    return res.status(500).send(errors.ERR_SRV);
  }

  let user;
  try {
    user = await getUserById(userId, { lean: false });
  } catch (err) {
    log.fatal({ err }, 'failed to get user');
    return res.status(500).send(errors.ERR_SRV);
  }

  if (!user) {
    return res.status(401).send('invalid user');
  }

  user.settings.wideLayout = wideLayout;

  try {
    await user.save();
  } catch (err) {
    log.fatal({ err }, 'failed to save user');
    return res.status(500).send(errors.ERR_SRV);
  }

  return res.status(200).send();
};
