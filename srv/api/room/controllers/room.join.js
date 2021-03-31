/**
 * Created by Zaccary on 23/09/2015.
 */

const jwt = require('jsonwebtoken');
const moment = require('moment');
const momentDurationFormat = require('moment-duration-format');
const log = require('../../../utils/logger.util')({ name: 'room.join' });
const { getCookie } = require('../../../utils/utils');
const { customError } = require('../../../utils/error.util');
const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');
const roomUtils = require('../room.utils');
const sitebanUtils = require('../../siteban/siteban.utils');
const redis = require('../../../lib/redis.util');
const redisUtils = require('../../../utils/redis.util');
const sanitizeUserList = require('./room.sanitize');
const { getUserById } = require('../../user/user.utils');
const roomCloseUtils = require('../../roomClose/roomClose.utils');
const { PermissionError } = require('../../../utils/error.util');
const {
  getUserEnrollments,
  getDefaultRoles,
  getUserHasRolePermissions,
} = require('../../role/role.utils');

momentDurationFormat(moment);

/**
 * Behaviour:
 * each route change will trigger a request to join a room
 * unless that route is reserved or a sub-directory (e.g. site.com/route/sub-route)
 * A change in route will immediately prompt a disconnect notice and as such,
 * leave room the user was in.
 *
 * Joining a room will require a unique username. A randomly generated username
 * will be assigned temporarily but a user should choose one via a prompt once
 * they have joined the room. Should that conflict with an existing user, an error
 * will occur (client-side as well as server-side to prevent lag from allowing
 * duplicate users)
 *
 * @param roomName
 * @param user
 * @param cb
 */
class RoomJoin {
  static async getRoomUser(userId) {
    let user;

    try {
      user = await getUserById(userId, { lean: true });
    } catch (err) {
      throw err;
    }

    if (!user) {
      const error = new Error();
      error.name = 'NotFoundError';
      error.message = 'User not found';
      throw error;
    }

    return {
      user_id: user._id,
      username: user.username,
      isAdmin: user.attrs.userLevel === 30,
      isSiteMod: user.attrs.userLevel >= 20,
      isSupporter: user.attrs.isSupporter,
      userIcon: user.settings.userIcon,
      emailVerified: user.auth.email_is_verified,
    };
  }

  constructor() {
    this.roomUtils = roomUtils;
    this.redis = redis();
    this.redisUtils = redisUtils;
    this.getCookie = getCookie;

    this.room = null;
    this.roles = [];
    this.enrollments = [];
  }

  getModerator(user) {
    return this.room.settings.moderators
      .find(m => (user.username && m.username === user.username)
        || (user.user_id && String(m.user_id) === String(user.user_id))
        || (user.session_id && m.session_token === user.session_id));
  }

  getRequiresVerified(user) {
    const { requireVerifiedEmail } = this.room.settings;
    const userHasVerifiedEmail = user ? user.emailVerified : false;

    if (requireVerifiedEmail) {
      return !userHasVerifiedEmail;
    }

    return false;
  }

  getHasMinAccountAge(user) {
    const { owner } = this.room.attrs;
    const { minAccountAge } = this.room.settings;

    if (owner.equals(user._id)) {
      return false;
    }

    if (!minAccountAge) {
      return false;
    }
    const { join_date: joinDate } = user.attrs;
    const accountAge = new Date().getTime() - joinDate.getTime();
    return minAccountAge > accountAge;
  }


  async shouldWarnAgeRestricted(roomUser, session = {}) {
    const { ageConfirmed } = session;

    if (ageConfirmed) {
      log.debug('age already confirmed');
      return false;
    }

    let user;
    let ageVerified = false;

    if (roomUser.user_id) {
      try {
        user = await getUserById(roomUser.user_id, { lean: true });
      } catch (err) {
        throw err;
      }
    }

    if (user) {
      ({ ageVerified } = user.attrs);
    }

    return this.room.attrs.ageRestricted && !ageVerified;
  }

  async checkRoomPasswordRequired(cookie, user) {
    if (this.room.settings.passhash) {
      if (user.attrs && user.attrs.userLevel >= 20) {
        return false;
      }

      if (String(this.room.attrs.owner) === String(user.user_id)) {
        return false;
      }

      try {
        const ident = {
          userId: user.user_id,
          ip: user.ip,
          sessionId: user.session_id,
        };

        await getUserHasRolePermissions(this.room.name, ident, 'bypassPassword');

        return false;
      } catch (err) {
        if (err instanceof PermissionError === false) {
          log.fatal({ err }, 'failed to check role permissions');
          throw err;
        }
      }

      const token = this.getCookie(`jic.password.${this.room.name}`, cookie);
      if (token) {
        log.debug('has token, checking validity');
        try {
          const { room: tokenRoomName } = await jwt.verify(token, config.auth.jwt_secret);

          if (tokenRoomName !== this.room.name) {
            return true;
          }

          return false;
        } catch (err) {
          log.error({ err }, 'error validating password token');
          return true;
        }
      }

      log.debug('no token, requires password');

      return true;
    }

    return false;
  }

  async checkRoomClosed() {
    const closed = await roomCloseUtils.getByRoomName(this.room.name);
    if (closed) {
      return closed;
    }

    return false;
  }

  async join(roomName, user, userListId, { cookie, session }, cb) {
    try {
      this.room = await this.roomUtils.getRoomByName(roomName);
    } catch (err) {
      return cb(err);
    }

    if (!this.room) {
      log.error({ roomName }, 'could not find room');
      return cb({ message: 'ERR_NO_ROOM' });
    }

    const userExists = this.room.users.find(u => String(u._id) === userListId);

    if (userExists) {
      log.warn('user has already joined the room');
      return cb({ message: 'ERR_USER_EXISTS' });
    }

    try {
      const closed = await this.checkRoomClosed();
      if (closed) {
        log.debug({ roomName: this.room.name }, 'attempting to join a closed room');
        return cb({
          error: 'ERR_ROOM_CLOSED',
          body: closed.reason,
        });
      }
    } catch (err) {
      log.fatal({ err }, 'error checking room close state');
      return cb({ error: 'ERR_SRV' });
    }

    let existingUser = {};
    let account;

    if (user.user_id) {
      try {
        existingUser = await RoomJoin.getRoomUser(user.user_id);
      } catch (err) {
        return cb(errors.ERR_SRV);
      }

      try {
        account = await getUserById(user.user_id, { lean: true });
      } catch (err) {
        log.fatal({ err, userId: user.user_id }, 'failed to get user');
        return cb(errors.ERR_SRV);
      }
    }

    if (this.room.settings.forceUser && !user.user_id) {
      log.warn('guest user attempted joining a room requiring registered users');
      return cb({
        error: 'ERR_ACCOUNT_REQUIRED',
      });
    }

    if (this.getRequiresVerified(existingUser)) {
      return cb({
        error: 'ERR_VERIFIED_EMAIL_REQUIRED',
      });
    }

    if (this.room.settings.forceUser) {
      if (this.getHasMinAccountAge(account)) {
        return cb({
          error: 'ERR_MIN_ACCOUNT_AGE',
          body: moment
            .duration(this.room.settings.minAccountAge)
            .format('d [days] h [hours] m [minutes]', { trim: 'both' }),
        });
      }
    }

    if (session.kicked) {
      session.kicked = false;
      return session.save((err) => {
        if (err) {
          log.fatal({ err }, 'failed to save session');
          return cb(err);
        }

        return cb({
          error: 'ERR_KICKED',
        });
      });
    }

    sanitizeUserList(roomName, (err) => {
      if (err) {
        log.fatal({ err }, 'error sanitizing user list');
      }
    });

    const userToAdd = {
      ...user,
      ...existingUser,
      color: this.roomUtils.getChatColor(),
    };

    try {
      const requiresPassword = await this.checkRoomPasswordRequired(cookie, userToAdd);
      if (requiresPassword) {
        log.debug('requires room password');
        return cb({
          error: 'ERR_PASSWORD_REQUIRED',
        });
      }
    } catch (err) {
      log.fatal({ err }, 'error fetching password requirement');
      return cb({ error: 'ERR_SRV' });
    }

    try {
      const ageWarning = await this.shouldWarnAgeRestricted(userToAdd, session);

      if (ageWarning) {
        log.debug('should warn adult room');
        return cb({
          error: 'ERR_AGE_WARNING',
        });
      }
    } catch (err) {
      log.fatal({ err }, 'error checking age warning');
      return cb({ error: 'ERR_SRV' });
    }


    // check ban list and prevent joining if user
    // has an active ban.
    try {
      const userIsBanned = await this.checkUserIsBanned(userToAdd, session.fingerprint);
      if (userIsBanned) {
        log.info({
          userIsBanned,
        }, 'user is banned from room');
        return cb({
          error: 'ERR_USER_BANNED',
          body: userIsBanned.reason,
        });
      }
    } catch (err) {
      log.fatal({ err }, 'error checking ban state');
      return cb(err);
    }

    if (!this.room.attrs.janus_id) {
      log.warn('janus ID is missing');
      this.room.attrs.janus_id = this.roomUtils.createUniqueIntegerId();
    }

    this.room.attrs.last_accessed = new Date();

    let defaultRoles;
    try {
      defaultRoles = await getDefaultRoles(this.room._id);
    } catch (err) {
      return cb(err);
    }
    let userRoles;
    try {
      const permanentRoom = Boolean(this.room.attrs.owner);
      let roleBody = {
        room: this.room._id,
        user: existingUser.user_id,
      };

      if (!permanentRoom) {
        roleBody = {
          ...roleBody,
          sessionId: user.session_id,
          ip: user.ip,
        };
      }

      const roles = await getUserEnrollments(roleBody);

      userRoles = [...defaultRoles.map(r => r.tag), ...roles.map(e => e.role.tag)];

      log.debug({ userRoles }, 'got user enrollments for new user');
    } catch (err) {
      return cb(err);
    }

    this.room.users = [
      ...this.room.users,
      {
        ...userToAdd,
        roles: userRoles,
      },
    ];

    try {
      this.room = await this.room.save();
    } catch (err) {
      log.fatal({ err }, 'Error saving room');
      return cb(err);
    }

    const addedUser = this.room.users.find(u => u.session_id === userToAdd.session_id);

    if (!addedUser) {
      log.error({ user: userToAdd }, 'could not find new user');
      return cb(errors.ERR_NO_USER);
    }

    try {
      const addedUserFormatted = {
        userListId: addedUser.id,
        sessionId: addedUser.session_id,
        ip: addedUser.ip,
        username: addedUser.username,
        userId: addedUser.user_id,
      };
      await this.roomUtils.addHistoryEntry(this.room._id, addedUserFormatted);
    } catch (err) {
      log.fatal({ err }, 'failed to create join history entry');
    }

    if (this.room.attrs.owner && addedUser.user_id) {
      try {
        await this.roomUtils.addRecentRoom(addedUser.user_id, this.room._id);
        log.debug('recent room entry added');
      } catch (err) {
        log.fatal({ err }, 'failed to add recent room entry');
      }
    }

    return this.attachClientToRoom(userToAdd, session.fingerprint, cb);
  }

  async checkUserIsBanned(user, fingerprint) {
    try {
      const siteban = await sitebanUtils.getBanlistItem({
        sessionId: user.session_id,
        ip: user.ip,
        userId: user.user_id,
        fingerprint,
      });

      if (siteban && siteban.restrictions.join) {
        return siteban;
      }

      const isOwner = this.room.attrs.owner
        && String(user.user_id) === String(this.room.attrs.owner);

      if (isOwner) {
        return false;
      }

      log.debug('checking room banlist');
      if (this.room.banlist.length === 0) {
        return false;
      }

      log.debug('room banlist has entries');

      const userIsBanned = this.room.banlist.find((banned) => {
        const userMatch = banned.ip === user.ip
            || (banned.user_id && String(banned.user_id._id) === String(user.user_id))
            || (banned.sessionId && banned.sessionId === user.session_id);

        const time = new Date().getTime();
        const banTimestamp = new Date(banned.timestamp).getTime();
        const banInEffect = (time - banTimestamp) < banned.banDuration;

        return userMatch && banInEffect;
      });

      return !!userIsBanned;
    } catch (err) {
      log.fatal({ err }, 'error checking site ban');
      throw err;
    }
  }

  checkModTimeout(moderator) {
    if (!moderator.assignedBy || !moderator.session_token) {
      return false;
    }

    if (String(moderator.assignedBy) === String(this.room.attrs.owner)) {
      return false;
    }

    const timeDiff = new Date().getTime() - new Date(moderator.timestamp).getTime();
    const hasTimedOut = timeDiff >= config.room.guestModTimeout;

    return hasTimedOut;
  }

  /**
   * Set required cache data to assign a user, via their socket ID, to a particular room
   * redis hash contains room name, ID and the room's Janus ID, as well as
   * whether the user is a moderator in that room
   *
   * @param {object} room
   * @param {object} user
   * @param cb callback function
   */
  async attachClientToRoom(user, fingerprint, cb) {
    const joinedUser = this.room.users.find(u => u.handle === user.handle);

    if (!joinedUser) {
      const error = customError('NoUserError', 'User not found');
      return cb(error);
    }

    const userListId = String(joinedUser._id);

    let roomData = {
      room_id: this.room._id.toString(),
      name: this.room.name,
      handle: user.handle,
      color: user.color,
      janus_id: this.room.attrs.janus_id,
      janusServerId: this.room.attrs.janusServerId,
      userListId,
      fingerprint,
    };

    if (user.user_id) {
      roomData = { ...roomData, userId: user.user_id };
    }

    try {
      await this.redisUtils.callPromise('hmset', user.socket_id, roomData);
    } catch (err) {
      log.fatal({ err }, 'error pushing room data into redis');
      return cb(err);
    }

    log.debug({ socket: user.socket_id }, 'user data saved to redis');

    try {
      await this.redisUtils.callPromise('expire', user.socket_id, 60 * 60 * 24);
    } catch (err) {
      log.fatal({ err }, 'failed to set expire on session entry');
    }

    // return the user that was added to the room document
    return cb(null, this.room);
  }
}

module.exports = RoomJoin;
