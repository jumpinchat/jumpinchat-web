/**
 * Created by Zaccary on 24/10/2015.
 */

const jwt = require('jsonwebtoken');
const moment = require('moment');
const log = require('../../../utils/logger.util')({ name: 'userCreateSession' });
const utils = require('../../../utils/utils');
const config = require('../../../config/env');
const { initialSession } = require('../../../config/session.config');
const userUtils = require('../user.utils');
const roomUtils = require('../../room/room.utils');
const videoQuality = require('../../../config/constants/videoQuality');

/**
 * Create a token from the session ID and return it.
 * Intended to be used to track users in rooms
 * in memcache and the room databases.
 *
 * @param req
 * @param res
 */
module.exports = function createSession(req, res) {
  let activityToken;
  const responseBody = {};
  const session = req.sessionID;
  const mergedSession = initialSession(req.session);
  const { fp } = req.body;

  req.session = Object.assign(
    req.session,
    mergedSession,
    {
      ignoreList: roomUtils.removeExpiredIgnoreListItems(mergedSession.ignoreList),
      fingerprint: fp,
    },
  );

  // if the user has a session cookie, and the user exists
  // in the system, consider them logged in
  const identId = req.signedCookies['jic.ident'];

  const returnUserData = () => {
    if (!req.cookies['jic.activity']) {
      log.debug('creating new activity token');
      activityToken = jwt.sign({ session }, config.auth.jwt_secret);
      res.cookie('jic.activity', activityToken, {
        maxAge: config.auth.activityTokenTimeout,
        httpOnly: true,
      });
      responseBody.token = activityToken;

      res
        .status(200)
        .send(responseBody);
    } else {
      log.debug('verifying existing activity token');
      jwt.verify(req.cookies['jic.activity'], config.auth.jwt_secret, (err) => {
        if (err) {
          log.warn({ err }, 'activity token invalid, recreating');

          // create a new token if unable to decode
          activityToken = jwt.sign({ session }, config.auth.jwt_secret);
          res.cookie('jic.activity', activityToken, {
            maxAge: config.auth.activityTokenTimeout,
            httpOnly: true,
          });
        } else {
          log.debug('activity token verified');
          activityToken = req.cookies['jic.activity'];
        }

        responseBody.token = activityToken;

        res
          .status(200)
          .send(responseBody);
      });
    }
  };

  if (identId) {
    return userUtils.getUserById(identId, { lean: false }, (err, user) => {
      if (err) {
        log.fatal({ err }, `failed to get user by id ${identId}`);
        return res.status(403).send({ error: 'forbidden' });
      }

      if (user) {
        const { supportExpires } = user.attrs;
        const isGold = user.attrs.isGold
          || (supportExpires && moment(supportExpires).isAfter(moment()));

        responseBody.user = {
          user_id: user._id,
          username: user.username,
          isAdmin: user.attrs.userLevel === 30,
          isSiteMod: user.attrs.userLevel >= 20,
          isSupporter: user.attrs.isSupporter,
          isGold,
          userIcon: user.settings.userIcon,
          settings: user.settings,
          videoQuality: videoQuality[user.settings.videoQuality],
        };

        user.attrs.last_active = new Date();
        user.attrs.last_login_ip = utils.getRemoteIpFromReq(req);
        user.auth.latestFingerprint = fp;

        user.save((err) => {
          if (err) {
            log.fatal({ err, userId: user._id }, 'error saving user');
            return false;
          }

          log.debug('updated user last seen');
          return true;
        });
      }
      return returnUserData();
    });
  }

  return returnUserData();
};
