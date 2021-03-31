const log = require('../../utils/logger.util')({ name: 'admin.controller' });
const Joi = require('joi');
const notifyServerRestart = require('./controllers/notifyServerRestart.controller');
const notify = require('./controllers/notify.controller');
const getActiveRooms = require('./controllers/getActiveRooms.controller');
const getRoomById = require('./controllers/getRoomById.controller');
const getUserList = require('./controllers/getUserList.controller');

let _io;

module.exports.setSocketIo = function setSocketIo(io) {
  log.debug({ io: !!io }, 'setSocketIo');
  _io = io;
};

module.exports.getSocketIo = function getSocketIo() {
  return _io;
};

module.exports.notifyServerRestart = function notifyServerRestartEndpoint(req, res) {
  notifyServerRestart(req.params.seconds, _io, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to start restart notification');
      res.status(500).send(err);
      return;
    }

    res.status(200).send();
  });
};

module.exports.notify = function notifyEndpoint(req, res) {
  const schema = Joi.object().keys({
    message: Joi.string().required(),
    type: Joi.string().valid([
      'INFO',
      'SUCCESS',
      'ALERT',
      'WARNING',
    ]).required(),
    room: Joi.string(),
  });

  Joi.validate(req.body, schema, (validateErr, validated) => {
    if (validateErr) {
      log.warn({ body: req.body, validateErr }, 'invalid body');
      return res.status(400).send(validateErr);
    }

    if (!_io) {
      log.fatal('socketIO not connected');
      return res.status(500).send();
    }

    notify(_io, validated, (notifyErr) => {
      if (notifyErr) {
        log.error({ notifyErr });
        return res.status(500).send('Broke it');
      }

      return res.status(200).send();
    });
  });
};

module.exports.getActiveRooms = getActiveRooms;
module.exports.getRoomById = getRoomById;
module.exports.getUserList = getUserList;
