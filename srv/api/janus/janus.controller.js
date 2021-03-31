/**
 * Created by Zaccary on 14/12/2015.
 */

const log = require('../../utils/logger.util')({ name: 'janus.controller' });
const config = require('../../config/env');
const roomUtils = require('../room/room.utils');

module.exports.getJanusEndpoints = function getJanusEndpoints(req, res) {
  const hostname = req.get('x-forwarded-host') || 'localhost';
  const endpoints = [];

  if (config.janus.wss_uri) {
    endpoints.push(`wss://${hostname}${config.janus.wss_uri}`);
  }

  if (config.janus.https_uri) {
    endpoints.push(`https://${hostname}${config.janus.https_uri}`);
  }

  if (config.janus.ws_uri) {
    endpoints.push(`ws://${hostname}${config.janus.ws_uri}`);
  }

  if (config.janus.http_uri) {
    endpoints.push(`https://${hostname}${config.janus.http_uri}`);
  }

  return res.status(200).send(endpoints);
};
