const jwt = require('jsonwebtoken');
const Jimp = require('jimp');
const { S3 } = require('aws-sdk');
const uuid = require('node-uuid');
const requestIp = require('request-ip');
const log = require('./logger.util')({ name: 'utils' });
const config = require('../config/env/');
const errors = require('../config/constants/errors');
const userUtils = require('../api/user/user.utils');
const roomUtils = require('../api/room/room.utils');
const redisUtils = require('./redis.util');
const rateLimit = require('./rateLimit');

const { accessKey, secret, bucket } = config.aws.s3.jicUploads;

const s3Client = new S3({
  accessKeyId: accessKey,
  secretAccessKey: secret,
  region: 'us-east-1',
});

module.exports.validateSession = function validateSession(req, res, next) {
  const token = req.cookies['jic.activity'];

  if (!token) {
    log.warn('no session token');
    return res.status(401).send();
  }

  return jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
    if (err) {
      log.fatal({ err }, 'error verifying activity token');
      return res.status(403).send();
    }

    if (!decoded) {
      log.error('session token could not be decoded');
      return res.status(401).send();
    }

    return next();
  });
};

module.exports.validateAccount = async function validateAccount(req, res, next) {
  let token;

  const identCookie = req.signedCookies['jic.ident'];

  if (identCookie) {
    token = identCookie;
  } else if (req.headers.authorization) {
    try {
      token = await jwt.verify(req.headers.authorization, config.auth.jwt_secret);
    } catch (err) {
      log.error({ err }, 'invalid authorization token');
      return res.status(401).send({ error: 'Unable to authenticate user' });
    }
  }

  if (!token) {
    log.warn('Identification token missing');
    return res.status(401).send({ error: 'Identification token missing' });
  }

  return userUtils.getUserById(token, { lean: true }, (err, user) => {
    if (err) {
      log.error({ err }, 'could not get user');
      return res.status(401).send({ error: 'Unable to authenticate user' });
    }

    if (!user) {
      log.error('user not found');
      return res.status(401).send({ error: 'Invalid user' });
    }

    req.user = user;

    return next();
  });
};

module.exports.verifyInternalSecret = function verifyInternalSecret(req, res, next) {
  const auth = req.headers.authorization;
  if (auth !== config.auth.sharedSecret) {
    log.error({ auth }, 'Invalid user attempted internal call');
    return res.status(401).send(errors.ERR_AUTH);
  }

  return next();
};

module.exports.messageFactory = function messageFactory(msg) {
  const commonMessageOpts = {
    timestamp: new Date(),
    id: uuid.v4(),
  };

  return { ...msg, ...commonMessageOpts };
};

module.exports.rateLimit = rateLimit;

/**
 * Update the lastSeen prop on the user document. Primarily
 * for showing when a user has last been active. This function is
 * triggered when a user initiates any socket event via the `*` wildcard.
 *
 * When first called, a key will be set with the format `lastSeen:<userId>`
 * and an expire time of 5 minutes is set. Each subsequent call will check the
 * TTL of the key and only procede if it has expired (TTL of `-2`). The reason for
 * this is to prevent excessive calls to the DB during busy sessions.
 */
module.exports.updateLastSeen = function updateLastSeen(socketId, cb = () => {}) {
  return roomUtils.getSocketCacheInfo(socketId, async (err, socketData) => {
    if (err) {
      log.fatal({ err }, 'error getting socket data');
      return cb(err);
    }

    if (!socketData) {
      log.warn({ socketId }, 'No socket data');
      return cb('ERR_NO_CACHE');
    }

    if (socketData.userId) {
      const lastSeenKey = `lastSeen:${socketData.userId}`;

      let ttl;
      try {
        ttl = await redisUtils.callPromise('ttl', lastSeenKey);
      } catch (err) {
        log.fatal({ err }, 'failed to get ttl');
        return cb(err);
      }

      if (ttl > -2) {
        log.debug({ lastSeenKey, ttl }, 'key hasnt expired, skipping');
        return cb();
      }

      let user;

      try {
        user = await userUtils.getUserById(socketData.userId, { lean: false });
      } catch (err) {
        log.fatal({ err }, 'error getting socket data');
        return cb(err);
      }

      if (!user) {
        log.error({ userId: socketData.userId }, 'user not found');
        return cb('ERR_NO_USER');
      }

      try {
        await Object.assign(user, {
          attrs: Object.assign(user.attrs, {
            last_active: new Date(),
          }),
        }).save();
      } catch (err) {
        log.fatal({ err }, 'error saving user');
        return cb(err);
      }

      log.debug('last seen date set');

      try {
        await redisUtils.callPromise('set', lastSeenKey, Date.now());
      } catch (err) {
        log.fatal({ err }, 'error setting last seen cache');
        return cb(err);
      }

      log.debug({ lastSeenKey }, 'new lastSeen key set');

      try {
        await redisUtils.callPromise('expire', lastSeenKey, config.redis.lastSeenExpire);
      } catch (err) {
        log.fatal({ err }, 'error setting last seen cache expire');
        return cb(err);
      }

      return cb(null, true, socketData.userId);
    }

    return cb();
  });
};

/**
 * Resize and normalize image quality and file type.
 *
 * @param {Buffer} fileBuffer
 * @param {Object} dimensions
 * @param {number} dimensions.width
 * @param {number} dimensions.height
 * @param {function} cb
 */
module.exports.convertImages = function convertImages(fileBuffer, dimensions, cb) {
  log.debug('converting images');

  Jimp
    .read(fileBuffer)
    .then((image) => {
      const mime = image.getMIME();

      if (mime === 'image/gif') {
        return cb(null, fileBuffer);
      }

      image
        .contain(
          dimensions.width,
          dimensions.height,
          Jimp.VERTICAL_ALIGN_MIDDLE,
          Jimp.HORIZONTAL_ALIGN_CENTER,
        );

      return image
        .quality(60)
        .getBuffer(mime, (err, convertedBuffer) => {
          if (err) {
            log.fatal({ err }, 'error getting image buffer');
            return cb(err);
          }

          return cb(null, convertedBuffer);
        });
    })
    .catch((err) => {
      log.fatal({ err }, 'error converting image');
      return cb(err);
    });
};

module.exports.mergeBuffers = function mergeBuffers(dataArr) {
  const dataLength = dataArr.map(d => d.length).reduce((a, b) => a + b);
  return Buffer.concat(dataArr.map(d => d.data), dataLength);
};

module.exports.s3Upload = function s3Upload(body, filePath, cb) {
  const params = {
    Bucket: bucket,
    Key: filePath,
    ACL: 'public-read',
    Body: body,
  };

  return s3Client
    .putObject(params)
    .on('build', (req) => {
      log.debug('setting cache controll header');
      req.httpRequest.headers['Cache-Control'] = 'public, max-age=86400';
    })
    .send(cb);
};

module.exports.isValidImage = function isValidImage(mimeType) {
  const isPng = mimeType === 'image/png';
  const isJpeg = mimeType === 'image/jpeg';
  const isGif = mimeType === 'image/gif';

  return isPng || isJpeg || isGif;
};

module.exports.getExtFromMime = function getExtFromMime(mimeType) {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
};

module.exports.getRemoteIpFromReq = function getRemoteIpFromReq(req) {
  const ip = requestIp.getClientIp(req);
  return ip;
};

module.exports.createNotification = function createNotification(type, level, message, opts = {}) {
  const notification = {
    type,
    level,
    message,
  };

  if (opts.action) {
    notification.action = opts.action;
  }

  if (opts.timeout) {
    notification.timeout = opts.timeout;
  }

  if (opts.id) {
    notification.id = opts.id;
  }

  return notification;
};

module.exports.getCookie = function getCookie(name, cookieString) {
  const value = `; ${cookieString}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
};

function verifyUserLevel(userId, authorization, level = 30) {
  return new Promise(async (resolve, reject) => {
    if (!userId) {
      log.debug('no cookie, attempting auth header');
      try {
        ({ userId } = await jwt.verify(authorization, config.auth.jwt_secret));
      } catch (err) {
        log.error({ err }, 'error verifying token');
        return reject(err);
      }
    }

    log.debug({ userId }, 'user id');

    if (userId) {
      try {
        const user = await userUtils.getUserById(userId, { lean: false });
        if (!user) {
          log.error('user not found');
          const error = new Error();
          error.name = 'NoUserError';
          error.message = 'User not found';
        }

        if (user.attrs.userLevel < level) {
          log.warn({
            level,
            userLevel: user.attrs.level,
          }, 'user not permitted to perform admin action');
          const error = new Error();
          error.name = 'PermissionDeniedError';
          error.message = 'User not permitted to perform admin action';
          return reject(error);
        }

        return resolve(user);
      } catch (err) {
        log.fatal({ err }, 'failed to get user');
        return reject(err);
      }
    } else {
      log.error('invalid token');
      const error = new Error();
      error.name = 'InvalidTokenError';
      error.message = 'Token is invalid';
      return reject(error);
    }
  });
}

module.exports.verifyAdmin = async function verifyAdmin(req, res, next) {
  const userId = req.signedCookies['jic.ident'];
  const { authorization } = req.headers;
  try {
    const user = await verifyUserLevel(userId, authorization, 30);
    req.user = user;
    return next();
  } catch (err) {
    log.error({ err, path: req.path }, 'auth error');
    return res.status(401).send(err.message);
  }
};

module.exports.verifySiteMod = async function verifyAdmin(req, res, next) {
  const userId = req.signedCookies['jic.ident'];
  const { authorization } = req.headers;
  try {
    const user = await verifyUserLevel(userId, authorization, 20);
    req.user = user;
    return next();
  } catch (err) {
    log.error({ err, path: req.path }, 'auth error');
    return res.status(401).send(err.message);
  }
};

module.exports.getSocketRooms = function getSocketRooms(io, socketId, cb) {
  io.of('/').adapter.clientRooms(socketId, (err, rooms) => {
    if (err) {
      log.fatal({ err }, 'error getting client rooms');
    }

    log.debug({ rooms, socketId }, 'socket rooms');
    cb(null, rooms[1]);
  });
};

module.exports.uploadDataUriToS3 = function uploadDataUriToS3(filePath, uri, cb) {
  if (!uri) {
    log.debug('no URI to upload');
    return cb();
  }

  const buf = Buffer.from(uri.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  return s3Client.putObject({
    Bucket: config.report.bucket,
    Key: filePath,
    Body: buf,
    ContentType: 'image/jpeg',
    ContentEncoding: 'base64',
    ACL: 'public-read',
  }, (err) => {
    if (err) {
      return cb(err);
    }

    const url = s3Client.getSignedUrl('getObject', {
      Bucket: config.report.bucket,
      Key: filePath,
      Expires: config.report.logTimeout,
    });

    return cb(null, url);
  });
};

module.exports.s3UploadVerification = function s3UploadVerification(body, filePath, cb) {
  const params = {
    Bucket: config.ageVerification.bucket,
    Key: filePath,
    Body: body,
  };

  return s3Client
    .putObject(params)
    .on('build', (req) => {
      log.debug('setting cache controll header');
      req.httpRequest.headers['Cache-Control'] = 'public, max-age=86400';
    })
    .send((err) => {
      if (err) {
        return cb(err);
      }

      const url = s3Client.getSignedUrl('getObject', {
        Bucket: config.ageVerification.bucket,
        Key: filePath,
        Expires: config.ageVerification.timeout,
      });

      return cb(null, url);
    });
};

module.exports.s3RemoveObject = function s3RemoveObject(bucket, object, cb) {
  const params = {
    Bucket: bucket,
    Key: object,
  };

  return s3Client.deleteObject(params, (err, data) => {
    if (err) {
      return cb(err);
    }

    return cb(null, data);
  });
};


module.exports.createError = function createError(name, message) {
  const err = new Error();
  err.message = message;
  err.name = name;
  return err;
};

module.exports.getHostDomain = function getHostDomain(req) {
  if (config.env === 'development') {
    return `http://localhost:${config.port}`;
  }

  const protocol = 'https';
  const hostname = process.env.DEPLOY_LOCATION === 'production'
    ? 'jumpin.chat'
    : 'local.jumpin.chat';

  return `${protocol}://${hostname}`;
};

module.exports.destroySocketConnection = function destroySocketConnection(io, socketId) {
  return new Promise((resolve, reject) => {
    io.of('/').adapter.remoteDisconnect(socketId, true, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};

module.exports.getIpFromSocket = function getIpFromSocket(socket) {
  if (socket.handshake.headers['x-forwarded-for']) {
    return socket.handshake.headers['x-forwarded-for']
      .split(',')
      .map(s => s.trim())[0];
  }

  return socket.handshake.address;
};
