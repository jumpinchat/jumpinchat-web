const crypto = require('crypto');
const config = require('../../config/env');
const log = require('../../utils/logger.util')({ name: 'api.turn' });

const generateTurnCredentials = function generateTurnCredentials(name) {
  const { ttl } = config.turn;
  const timestamp = parseInt(Date.now() / 1000, 10) + ttl;
  const username = [timestamp, name || timestamp].join(':');

  const hash = crypto.createHmac('sha1', config.auth.turnSecret);
  hash.setEncoding('base64');
  hash.write(username);
  hash.end();
  const password = hash.read();
  return {
    password,
    username,
  };
};

module.exports.getTurnCreds = function getTurnCreds(req, res) {
  const uris = config.turn.uris
    .map(uri => ([
      `turn:${uri}:5349`,
    ]))
    .reduce((a, b) => a.concat(b));

  log.debug({ uris }, 'getTurnCreds');

  const { ttl } = config.turn;
  const creds = generateTurnCredentials(req.query.username);

  const responseObj = {
    username: creds.username,
    password: creds.password,
    uris,
    ttl,
  };

  res.status(200).send(responseObj);
};
