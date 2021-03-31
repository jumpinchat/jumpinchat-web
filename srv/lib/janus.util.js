/**
 * Created by Zaccary on 09/09/2015.
 */

const request = require('request');
const uuid = require('uuid');
const crypto = require('crypto');
const log = require('../utils/logger.util')({ name: 'janus' });
const config = require('../config/env');
const { JanusError } = require('../utils/error.util');

function generateTransactionString() {
  return uuid.v4();
}

function getJanusToken() {
  const expiry = Math.floor((Date.now() / 1000) + config.janus.token.expire).toString();
  const body = `${expiry},janus,${config.janus.token.plugins}`;
  const hmac = crypto.createHmac('sha1', config.janus.token.secret);
  hmac.setEncoding('base64');
  hmac.write(body);
  hmac.end();

  const token = `${body}:${hmac.read()}`;

  return token;
}

module.exports.getJanusToken = getJanusToken;

function createAdminRequest(body, opts, cb) {
  const port = 7888;
  let janusUri = process.env.NODE_ENV === 'production'
    ? `http://${opts.serverId}:${port}/admin`
    : config.janus.http_admin_uri_internal;

  if (opts.session) {
    janusUri = `${janusUri}/${opts.session}`;
  }

  if (opts.handle) {
    janusUri = `${janusUri}/${opts.handle}`;
  }

  log.debug({ url: janusUri }, 'sending request');

  const requestOptions = {
    method: 'POST',
    url: janusUri,
    body: {
      ...body,
      transaction: generateTransactionString(),
      token: getJanusToken(),
    },
    json: true,
    headers: {
      JANUS_SERVER_ID: opts.serverId,
    },
  };

  log.debug({ requestOptions }, 'final request options');

  return request(requestOptions, cb);
}


/**
 * check that a janus room exists by it's ID
 *
 * @param room - room ID
 * @param session
 * @param handle
 * @param cb
 */
function checkRoomExists(serverId, room, cb) {
  const req = {
    janus: 'message_plugin',
    transaction: generateTransactionString(),
    plugin: 'janus.plugin.videoroom',
    request: {
      request: 'exists',
      room,
    },
  };

  // determine whether the room exists or not
  // if true, return room id and deem it a success
  createAdminRequest(req, { serverId }, (err, response, body) => {
    if (err) {
      return cb(err);
    }

    if (response.statusCode >= 400) {
      log.fatal({ statusCode: response.statusCode }, 'janus error');
      return cb('ERR_JANUS');
    }

    return cb(null, body.response.exists);
  });
}

module.exports.checkRoomExists = (serverId, room, cb) => {
  checkRoomExists(serverId, room, cb);
};


/**
 * Create a new janus room, or return the ID if the room exists
 *
 * @param {Number} room - Janus room ID
 * @param {Object} sessionData - Janus session IDs
 * @param cb
 * @returns {*}
 */
module.exports.createRoom = function createRoom(serverId, room, cb) {
  if (!room) {
    return cb('no room ID supplied');
  }

  log.debug({ room, serverId }, 'creating new janus room');

  return checkRoomExists(serverId, room, (err, exists) => {
    if (err) {
      log.fatal({ err }, 'error checking for existing room');
      return cb(err);
    }

    log.debug({ exists }, 'does janus room exist?');

    if (!exists) {
      log.debug({ room }, 'room  does not exist. Creating new room');

      const req = {
        janus: 'message_plugin',
        transaction: generateTransactionString(),
        plugin: 'janus.plugin.videoroom',
        request: {
          request: 'create',
          room,
          publishers: config.janus.room.roomSize,
          bitrate: config.janus.room.bitrate,
          videocodec: config.janus.room.codec,
          transport_wide_cc_ext: true,
          fir_freq: 10,
        },
      };

      return createAdminRequest(req, { serverId }, (err, response, body) => {
        if (err) {
          log.fatal({ err }, 'error creating Janus room');
          return cb(err);
        }

        if (response.statusCode >= 400) {
          log.fatal({ statusCode: response.statusCode }, 'janus error');
          return cb('ERR_JANUS');
        }

        return cb(null, body.response.room);
      });
    }

    log.info(`room ${room} exists, returning existing room ID`);
    return cb(null, room);
  });
};

/**
 * remove a janus room
 *
 * @param {Number} room - the ID of the room in Janus
 * @param {Object} sessionData - Janus session IDs
 * @param {Function} cb
 */
module.exports.removeRoom = function removeRoom(serverId, room, cb) {
  log.info({ serverId, room }, 'removing Janus room');

  const req = {
    janus: 'message_plugin',
    transaction: generateTransactionString(),
    plugin: 'janus.plugin.videoroom',
    request: {
      request: 'destroy',
      room,
    },
  };

  createAdminRequest(req, { serverId }, (err, response) => {
    if (err) {
      return cb(err);
    }

    if (response.statusCode >= 400) {
      log.fatal({ statusCode: response.statusCode }, 'janus error');
      return cb('ERR_JANUS');
    }

    log.debug({ room }, 'room removed');

    return cb();
  });
};

module.exports.listSessions = function listSessions(serverId, cb) {
  const req = {
    janus: 'list_sessions',
  };

  createAdminRequest(req, { serverId }, (err, response, body) => {
    if (err) {
      return cb(err);
    }

    if (response.statusCode >= 400) {
      log.fatal({ statusCode: response.statusCode }, 'janus error');
      return cb('ERR_JANUS');
    }

    if (!body) {
      log.fatal({ response }, 'response body missing');
      return cb(new JanusError('Unknown error'));
    }

    return cb(null, body.sessions);
  });
};

module.exports.listParticipants = function listParticipants(serverId, room) {
  const req = {
    janus: 'message_plugin',
    transaction: generateTransactionString(),
    plugin: 'janus.plugin.videoroom',
    request: {
      request: 'listparticipants',
      room,
    },
  };

  const opts = {
    serverId,
  };

  return new Promise((resolve, reject) => {
    createAdminRequest(req, opts, (err, response, body) => {
      if (err) {
        log.fatal({ err }, 'failed to list participants');
        return reject(err);
      }

      if (body.janus !== 'success') {
        const error = new JanusError(body.error);
        log.error({ body });
        return reject(error);
      }

      log.debug({ body });

      const {
        response: {
          participants,
        },
      } = body;

      return resolve(participants);
    });
  });
};

function listRooms(serverId) {
  const req = {
    janus: 'message_plugin',
    transaction: generateTransactionString(),
    plugin: 'janus.plugin.videoroom',
    request: {
      request: 'list',
    },
  };

  const opts = {
    serverId,
  };

  return new Promise((resolve, reject) => {
    createAdminRequest(req, opts, (err, response, body) => {
      if (err) {
        log.fatal({ err }, 'failed to lsit rooms');
        return reject(err);
      }

      if (response.statusCode >= 400) {
        const error = new JanusError(`Response failed: ${response.statusCode}`);
        log.fatal({ statusCode: response.statusCode }, 'janus request error');
        return reject(error);
      }

      if (!body) {
        log.fatal({ response }, 'unknown error, no response body');
        return reject(new JanusError('Unknown error'));
      }

      if (body.janus !== 'success') {
        const error = new JanusError(body.error);
        log.error({ body });
        return reject(error);
      }

      return resolve(body);
    });
  });
}

module.exports.listRooms = listRooms;

module.exports.destroySession = async function destroySession(serverId, sessionId) {
  const req = {
    janus: 'destroy_session',
    transaction: generateTransactionString(),
  };

  const opts = {
    serverId,
    session: sessionId,
  };

  return new Promise((resolve, reject) => {
    createAdminRequest(req, opts, (err, response, body) => {
      if (err) {
        log.fatal({ err }, 'failed to destroy session');
        return reject(err);
      }

      if (response.statusCode >= 400) {
        log.fatal({ statusCode: response.statusCode }, 'janus error');
        return reject(new JanusError(`Response failed: ${response.statusCode}`));
      }

      if (body.janus !== 'success') {
        const error = new JanusError(body.error);
        log.error({ body }, 'janus error');
        return reject(error);
      }

      return resolve(body);
    });
  });
};
