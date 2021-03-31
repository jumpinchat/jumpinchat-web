const express = require('express');

const app = exports.app = express();
const server = require('http').createServer(app);
const sio = require('socket.io')(server);
const config = require('./config/env');
const log = require('./utils/logger.util')({ name: 'server' });


require('./config/express.config')(app, sio);
require('./config/mongoose.config')();
require('./lib/redis.util');
require('./config/socket.config')(sio);
require('./routes')(app);

server.listen(config.port, (err) => {
  if (err) {
    throw err;
  }

  log.info({
    port: config.port,
    env: config.env,
    videoCodec: config.janus.room.codec,
  }, 'server listening');
});
