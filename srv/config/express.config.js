/**
 * Created by vivaldi on 25/10/2014.
 */

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('errorhandler');
const RedisStore = require('connect-redis')(session);
const path = require('path');
const ejs = require('ejs');
const sioSession = require('express-socket.io-session');
const redis = require('../lib/redis.util');
const config = require('./env');
const log = require('../utils/logger.util')({ name: 'express.config' });

module.exports = function expressConfig(app, io) {
  const env = app.get('env');
  const cookieParserInstance = cookieParser(config.auth.cookieSecret);
  const sessionInstance = session({
    store: new RedisStore({
      client: redis(),
    }),
    resave: false,
    saveUninitialized: true,
    secret: config.auth.cookieSecret,
    cookie: {
      secure: config.auth.secureSessionCookie,
    },
  });
  app.use(sessionInstance);
  app.use(cookieParserInstance);

  io.use(sioSession(sessionInstance, cookieParserInstance, {
    autoSave: true,
  }));

  app.set('views', `${config.root}/srv/views`);
  app.set('view engine', 'pug');
  app.disable('x-powered-by');
  app.engine('ejs', ejs.renderFile);
  app.use((req, res, next) => {
    if (req.headers['x-amz-sns-message-type']) {
      req.headers['content-type'] = 'application/json;charset=UTF-8';
    }
    next();
  });
  app.use('/api/payment/stripe/event', bodyParser.raw({ type: '*/*' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.use(express.static(path.join(config.root, config.appPath)));
  app.set('appPath', config.root + config.appPath);

  if (env === 'development') {
    log.debug({ staticPath: path.join(config.root, '.tmp') });
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'node_modules')));
    app.use(errorHandler());
  }
};
