/**
 * Created by Zaccary on 24/05/2016.
 */

const log = require('../../../utils/logger.util')({ name: 'changeHandle.socket' });
const utils = require('../../../utils/utils');
const errors = require('../../../config/constants/errors');
const socketFloodProtect = require('../../../utils/socketFloodProtect');
const roomController = require('../room.controller');

module.exports = function changeHandleSocket(socket, io) {
  return async function changeHandle(msg, context = 'modal') {
    try {
      await socketFloodProtect(socket);
    } catch (err) {
      log.error({ err }, 'socket flood failed');
      return socket.emit('client::error', utils.messageFactory({
        context: 'chat',
        message: err.message || 'An unexpected server error occurred',
        error: err.name,
      }));
    }

    return roomController.changeHandle(socket.id, msg.handle, (err, result) => {
      if (err) {
        if (err.message) {
          log.error({ err }, 'changeHandle error');
          return socket.emit('client::error',
            utils.messageFactory({
              context,
              modal: 'changeHandle',
              message: err.message,
              error: err.error,
            }));
        }

        return socket.emit('client::error',
          utils.messageFactory({
            context,
            modal: 'changeHandle',
            ...errors.ERR_SRV,
          }));
      }

      socket.emit('client::handleChange', {
        handle: result.newHandle,
      });

      io.to(result.room).emit('room::handleChange',
        {
          userId: result.uuid,
          handle: result.newHandle,
        });

      return io.to(result.room).emit('room::status',
        utils.messageFactory({
          message: `${result.oldHandle} changed their name to ${result.newHandle}`,
        }));
    });
  };
};
