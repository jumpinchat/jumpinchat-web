const Joi = require('joi');
const messageUtils = require('../message.utils');
const log = require('../../../utils/logger.util')({ name: 'adminMessageAll' });
const Queue = require('../../../utils/queue.util');
const userUtils = require('../../user/user.utils');
const errors = require('../../../config/constants/errors');

module.exports = async function adminMessageAll(req, res) {
  let sender;
  const schema = Joi.object().keys({
    message: Joi.string(),
  });

  try {
    sender = await userUtils.getUserByName('jumpinchat');
  } catch (err) {
    log.fatal({ err }, 'failed to get meta user');
    return res.status(500).send(err);
  }

  if (!sender) {
    log.fatal('meta user not found');
    return res.status(500).send(errors.ERR_NO_USER);
  }

  try {
    const {
      error,
      value: {
        message,
      },
    } = await Joi.validate(req.body, schema);

    if (error) {
      return res.status(400).send(error);
    }


    return userUtils.getAllUsersNoPaginate((err, users) => {
      if (err) {
        log.fatal({ err }, 'Error getting all users');
        return res.status(500).end();
      }

      const queue = new Queue(messageUtils.addMessage, 100);

      queue.on('done', () => {
        log.info('message send queue complete');
      });

      queue.on('error', (err) => {
        log.error({ err }, 'message send failed');
      });

      users.forEach((recipient) => {
        const args = [sender._id, String(recipient._id), message];
        queue.addToQueue(args);
      });

      return res.status(200).send();
    });
  } catch (err) {
    log.error({ err }, 'validation error');
    return res.status(500).send(errors.ERR_VALIDATION);
  }
};
