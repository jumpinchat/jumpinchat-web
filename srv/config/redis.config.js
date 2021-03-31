/**
 * Created by vivaldi on 23/11/2014.
 */

const redis = require('redis');
const config = require('./env');

module.exports = function () {
  redis.createClient = redis.createClient();
};
