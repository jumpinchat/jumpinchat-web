const log = require('../../../utils/logger.util')({ name: 'notify.controller' });
const utils = require('../../../utils/utils');

module.exports = function notify(io, body, cb) {
  if (!io) {
    log.fatal('socket io not available');
    return cb(new Error('socket io not set'));
  }

  log.info({ body }, 'sending server-wide notification');

  const message = utils.messageFactory({
    context: 'chat',
    message: body.message,
    type: body.type.toLowerCase(),
  });

  if (body.room) {
    io.to(body.room).emit('room::status', message);
  } else {
    io.emit('room::status', message);
  }

  return cb(null);
};
