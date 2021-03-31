/**
 * Created by vivaldi on 08/11/2014.
 */

const mongoose = require('mongoose');
const config = require('./env');
const log = require('../utils/logger.util')({ name: 'mongoose.config' });

if (config.env === 'development') {
  mongoose.set('debug', (coll, method, query, doc, options) => {
    const set = {
      coll,
      method,
      query,
      doc,
      options,
    };

    // log.info({ dbQuery: set });
  });
}

module.exports = function mongooseConfig() {
  mongoose.connect(config.mongo.uri, config.mongo.options, (err) => {
    if (err) {
      log.fatal({ err }, 'failed to connect to MongoDB');
      throw err;
    }
  });

  mongoose.connection.on('connected', () => {
    log.info('Mongoose connected');
  });

  mongoose.connection.on('error', (err) => {
    log.fatal({ err }, 'mongoose error');
  });

  mongoose.connection.on('disconnected', () => {
    log.fatal('Mongoose disconnected');
  });
};
