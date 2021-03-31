/**
 * Created by vivaldi on 09/11/2014.
 */

const url = require('url');
const sioJwt = require('socketio-jwt');
const sioWildcard = require('socketio-wildcard')();
const socketIoRedis = require('socket.io-redis');
const log = require('../utils/logger.util')({ name: 'socket.config' });
const redis = require('../lib/redis.util');
const config = require('./env');
const utils = require('../utils/utils');

const trophyUtils = require('../api/trophy/trophy.utils');
const roomSocket = require('../api/room/room.socket');
const userSocket = require('../api/user/user.socket');
const youtubeSocket = require('../api/youtube/youtube.socket');
const roomController = require('../api/room/room.controller');
const adminController = require('../api/admin/admin.controller');
const roleUtils = require('../api/role/role.utils');

function _onConnect(socket, io) {
  roomSocket.register(socket, io);
  userSocket.register(socket, io);
  youtubeSocket.register(socket, io);
}

module.exports = function socketConfig(io) {
  io.use(sioJwt.authorize({
    secret: config.auth.jwt_secret,
    handshake: true,
  }));

  io.use(sioWildcard);

  const rtg = url.parse(config.redis.uri);
  io.adapter(socketIoRedis({
    host: rtg.hostname,
    port: rtg.port,
    pub: redis(),
    sub: redis(),
  }));

  adminController.setSocketIo(io);
  roomController.setSocketIo(io);
  roleUtils.setSocketIo(io);

  io.on('connection', (socket) => {
    log.info({ socketId: socket.id }, 'Connected to socket');
    socket.on('*', () => {
      utils.updateLastSeen(socket.id, async (err, updated, userId) => {
        if (err) {
          log.error({ err }, 'failed to update last seen');
          return false;
        }

        if (updated) {
          log.debug('user last seen updated');

          try {
            await trophyUtils.dedupe(userId);
            log.info({ userId }, 'deduped trophies');
          } catch (err) {
            log.fatal({ err }, 'failed deduping trophies');
          }

          return trophyUtils.findApplicableTrophies(userId, async (err) => {
            if (err) {
              log.fatal({ err }, 'failed to find applicable trophies');
              return false;
            }

            log.debug('saved user trophies');
          });
        }

        log.debug('user last seen not updated');
      });
    });

    socket.on('disconnect', () => {
      log.debug({ socketId: socket.id }, 'socket disconnected');
    });

    socket.on('error', (err) => {
      log.error({ err }, 'socket error');
    });

    socket.connectedAt = new Date();

    _onConnect(socket, io);
  });
};
