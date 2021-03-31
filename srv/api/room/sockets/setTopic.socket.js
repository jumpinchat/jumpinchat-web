const utils = require('../../../utils/utils');
const log = require('../../../utils/logger.util')({ name: 'setTopic.socket' });
const setTopicController = require('../controllers/room.setTopic');
const socketFloodProtect = require('../../../utils/socketFloodProtect');

module.exports = function setTopicSocket(socket, io) {
  return async function setTopic(msg) {
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

    if (msg.topic === undefined) {
      return socket.emit('client::error',
        utils.messageFactory({
          context: 'banner',
          message: 'No topic provided',
        }));
    }

    let handle;
    let topic;
    let room;

    try {
      const result = await setTopicController(socket.id, msg.topic);
      ({ handle, topic, room } = result);
    } catch (err) {
      log.error({ err });
      return socket.emit('client::error',
        utils.messageFactory({
          context: 'modal',
          modal: 'settings.room.info.topic',
          message: err.message,
        }));
    }

    io.to(room).emit('room::settings', {
      topic,
    });

    return io.to(room).emit('room::status',
      utils.messageFactory({
        message: `${handle} changed the room topic to "${topic.text}"`,
      }));
  };
};
