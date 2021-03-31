/** * Created by Zaccary on 22/09/2015.
 */
const jwt = require('jsonwebtoken');
const { omit, pick } = require('lodash');
const async = require('async');
const uuid = require('uuid');
const Queue = require('../../utils/queue.util');
const RoomModel = require('./room.model');
const RoomHistoryModel = require('./roomHistory.model');
const RecentRoomsModel = require('./recentRooms.model');
const config = require('../../config/env');
const log = require('../../utils/logger.util')({ name: 'room.utils' });
const { NotFoundError } = require('../../utils/error.util');
const redisUtils = require('../../utils/redis.util');
const janusUtil = require('../../lib/janus.util');
const makeUserOperator = require('./utils/room.utils.makeUserOperator.js');
const checkOperatorPermissions = require('./utils/room.utils.checkOperatorPermissions');
const adjectives = require('../../lib/adjectives.json');
const nouns = require('../../lib/nouns.json');
const removeUser = require('./controllers/room.removeUser');
const selectJanusServer = require('./utils/selectJanusServer');

const removeUserQueue = new Queue(removeUser, 100);
removeUserQueue.on('done', () => log.debug('remove user queue finished'));


function getRoomById(id, cb) {
  const query = RoomModel.findOne({ _id: id });

  if (cb) {
    return query.exec(cb);
  }

  return query.exec();
}
module.exports.getRoomById = getRoomById;

module.exports.getRoomUserListById = function getRoomUserListById(roomId, cb) {
  RoomModel.findOne({ _id: roomId })
    .select('users')
    .exec(cb);
};

module.exports.getRoomIdFromName = function getRoomIdFromName(name) {
  return RoomModel.findOne({ name })
    .select('_id')
    .exec();
};

module.exports.getMediaByRoomName = function getMediaByRoomName(name) {
  return RoomModel
    .findOne({ name })
    .populate({
      path: 'media.startedBy',
      select: ['username', 'profile.pic'],
    })
    .select('media')
    .exec();
};

function getRoomByName(name, cb) {
  const query = RoomModel
    .findOne({ name })
    .populate({
      path: 'media.startedBy',
      select: ['username', 'profile.pic'],
    })
    .populate({
      path: 'banlist.user_id',
      select: ['username'],
    })
    .populate({
      path: 'settings.topic.updatedBy',
      select: ['username'],
    });

  if (!cb) {
    return query.exec();
  }

  return query.exec(cb);
}

module.exports.getRoomByName = getRoomByName;

/**
 *
 * @param {Array} janusIdArr
 * @param cb
 */
const getRoomsByJanusIds = function getRoomsByJanusIds(janusIdArr, cb) {
  log.debug({ janusIdArr }, 'janus ID array');
  RoomModel
    .find({
      'attrs.janus_id': {
        $in: janusIdArr,
      },
    })
    .exec(cb);
};

module.exports.getRoomsByJanusIds = getRoomsByJanusIds;

module.exports.getRoomsByUser = function getRoomsByUser({ userId, sessionId, ip }) {
  let queryParams = [
    { 'users.ip': ip },
  ];

  if (userId) {
    queryParams = [
      ...queryParams,
      { 'users.user_id': userId },
    ];
  }

  if (sessionId) {
    queryParams = [
      ...queryParams,
      { 'users.session_id': sessionId },
    ];
  }
  return RoomModel
    .find({
      $or: queryParams,
    })
    .exec();
};

module.exports.getUserByListId = function getUserByListId(userListId) {
  return new Promise(async (resolve, reject) => {
    let room;
    try {
      room = await RoomModel.findOne({ 'users._id': userListId }).exec();
    } catch (err) {
      return reject(err);
    }

    if (!room) {
      const error = new Error();
      error.name = 'NotFoundError';
      error.message = 'Room not found';
      return reject(error);
    }

    const user = room.users.find(u => String(userListId) === String(u._id));

    if (!user) {
      const error = new Error();
      error.name = 'NotFoundError';
      error.message = 'Room user not found';
      return reject(error);
    }

    return resolve(user);
  });
};

/**
 *
 * return a hex code for one of an array of preset chat colors
 * to use to color a user's messages in the chat window
 *
 * if no argument is provided, it will choose a random color, else it
 * will return the color at the index.
 *
 * @param currentColor
 * @returns {*}
 */
module.exports.getChatColor = function getChatColor(currentColor) {
  if (currentColor) {
    if (config.chatcolors.indexOf(currentColor) === (config.chatcolors.length - 1)) {
      return config.chatcolors[0];
    }

    return config.chatcolors[config.chatcolors.indexOf(currentColor) + 1];
  }

  return config.chatcolors[Math.floor(Math.random() * config.chatcolors.length)];
};

function _createUniqueIntegerId() {
  return uuid.v4();
}

module.exports.createUniqueIntegerId = _createUniqueIntegerId;

function _createGuestHandle() {
  const adjectiveIndex = Math.round(Math.random() * adjectives.length);
  const nounIndex = Math.round(Math.random() * nouns.length);
  return `${adjectives[adjectiveIndex]}_${nouns[nounIndex]}`;
}

module.exports.createGuestHandle = _createGuestHandle;

/**
 * create a default guest user, using a generated
 * handle and info contained in their socket object
 *
 * @param socket
 */
module.exports.createGuestUser = function createGuestUser(socket) {
  return {
    ip: socket.handshake.address,
    signature: 'superawesomesignaturebro',
    session_id: jwt.decode(socket.handshake.query.token),
    handle: _createGuestHandle(),
    socket: socket.id,
  };
};

/**
 * remove all users who's sockets have disconnected
 *
 * @param sockets
 * @param roomName
 * @param cb
 */
module.exports.sanitizeUserList = function sanitizeUserList(sockets, roomName, cb) {
  RoomModel.findOne({ name: roomName })
    .exec((err, room) => {
      if (err) {
        return cb(err);
      }

      if (!room) {
        return cb('ERR_NO_ROOM');
      }

      const usersToBeRemoved = room.users.filter(user => !sockets[user.socket_id]);

      room.users = room.users.filter(user => !!sockets[user.socket_id]);

      room.save(() => cb(null, usersToBeRemoved));
    });
};

async function selectJanusServerLeastConn(cb) {
  try {
    const server = await selectJanusServer();
    return cb(null, server);
  } catch (err) {
    return cb(err);
  }
}

function selectJanusServerId(cb) {
  selectJanusServerLeastConn((err, serverId) => {
    if (err) {
      log.fatal({ err }, 'could not get janus server');
      return cb(err);
    }

    return cb(null, serverId);
  });
}


module.exports.getActiveRoomCount = function getActiveRoomCount(publicOnly = false) {
  if (publicOnly) {
    return RoomModel.countDocuments({
      users: {
        $gt: [],
      },
      'settings.public': true,
    }).exec();
  }
  return RoomModel.countDocuments({ users: { $gt: [] } }).exec();
};

module.exports.getActiveRooms = function getActiveRooms(start, end, publicOnly, cb) {
  let filter = {
    $match: {
      users: {
        $gt: [],
      },
    },
  };

  if (publicOnly) {
    filter = {
      $match: {
        users: {
          $gt: [],
        },
        'settings.public': true,
      },
    };
  }

  RoomModel
    .aggregate([
      filter,
      {
        $addFields: {
          userCount: { $size: '$users' },
          broadcastCount: {
            $size: {
              $filter: {
                input: '$users',
                as: 'user',
                cond: { $eq: ['$$user.isBroadcasting', true] },
              },
            },
          },
        },
      },
      {
        $sort: {
          broadcastCount: -1,
          userCount: -1,
          'attrs.last_accessed': -1,
        },
      },
      { $skip: start },
      { $limit: end },
    ])
    .exec(cb);
};

function createJanusSession(serverId, janusId, cb) {
  log.debug({ janusId }, 'create janus session');
  return janusUtil.getSessionHandle(serverId, async (err, sessionData) => {
    if (err) {
      return cb(err);
    }

    log.debug({ sessionData }, 'new janus data');

    const key = `${serverId}:${janusId}`;

    try {
      await redisUtils.callPromise('hmset', key, sessionData);
    } catch (setErr) {
      return cb(setErr);
    }

    try {
      await redisUtils.callPromise('expire', key, 10);
    } catch (setErr) {
      return cb(setErr);
    }

    log.debug('set janus session data in redis');
    return cb(null, sessionData);
  });
}

module.exports.checkForJanusRoom = async function checkForJanusRoom(serverId, janusId, cb) {
  let rooms;
  try {
    const { response } = await janusUtil.listRooms(serverId);

    rooms = response.list;
  } catch (err) {
    return cb(err);
  }
  const janusRooms = rooms.map(room => room.room);

  if (janusRooms.includes(janusId)) {
    return cb(null, true);
  }

  return cb(null, false);
};

function createJanusRoom(janusId, cb) {
  log.debug('createJanusRoom');
  if (!janusId) {
    janusId = _createUniqueIntegerId();
  }

  return selectJanusServerId((err, janusServerId) => {
    if (err) {
      log.fatal({ err }, 'error selecting janus server ID');
      return cb(err);
    }

    if (!janusServerId) {
      log.fatal('somehow the janus server ID is missing');
      return cb(new Error('Missing Janus server ID'));
    }

    log.debug({ janusServerId }, 'got janus server ID, creating new room');

    return janusUtil.createRoom(
      janusServerId,
      janusId,
      (err, janusRoomId) => cb(err, janusRoomId, janusServerId),
    );
  });
}

module.exports.createJanusRoom = createJanusRoom;

module.exports.createJanusRoomAsync = function createJanusRoomAsync(janusId) {
  return new Promise((resolve, reject) => {
    createJanusRoom(janusId, (err, janusRoomId, serverId) => {
      if (err) {
        return reject(err);
      }

      return resolve({ janusRoomId, serverId });
    });
  });
};

module.exports.removeJanusRoom = function removeJanusRoom(serverId, janusId, cb) {
  if (cb) {
    return janusUtil.removeRoom(serverId, janusId, cb);
  }

  return new Promise((resolve, reject) => janusUtil.removeRoom(serverId, janusId, (err) => {
    if (err) {
      return reject(err);
    }

    return resolve();
  }));
};


async function clearEmptyRoomsInServer(serverId, cb) {
  // create a janus session with which to create the new room
  let janusRoomList;

  try {
    const { response } = await janusUtil.listRooms(serverId);
    janusRoomList = response.list;
  } catch (err) {
    log.fatal({ err }, 'failed to get janus room list');
    return cb(err);
  }

  if (!janusRoomList) {
    log.error('no janus rooms');
    return cb();
  }

  const emptyJanusRooms = janusRoomList
    .filter(room => room.num_particpants === 0)
    .map(({ room }) => room);

  async.each(emptyJanusRooms, (room, unusedCb) => {
    log.debug({ serverId, room }, 'removing unused janus room');
    janusUtil.removeRoom(serverId, room, (err) => {
      if (err) {
        return unusedCb(err);
      }

      return unusedCb();
    });
  }, (err) => {
    if (err) {
      log.error({ err }, 'error removing empty janus rooms');
      return cb(err);
    }

    log.info({ count: emptyJanusRooms.length }, 'cleaned up empty rooms');
    return cb();
  });
}

module.exports.clearEmptyJanusRooms = function clearEmptyJanusRooms(cb) {
  log.info('clearing empty janus rooms');
  async
    .each(config.janus.serverIds, (serverId, serverCb) => clearEmptyRoomsInServer(serverId, serverCb),
      (err) => {
        if (err) {
          log.fatal({ err }, 'error clearing empty janus rooms');
          return cb(err);
        }

        log.debug('cleared empty janus rooms');
        return cb();
      });
};

module.exports.getSocketCacheInfo = async function getSocketCacheInfo(socketId, cb) {
  if (!cb) {
    return redisUtils.callPromise('hgetall', socketId);
  }

  try {
    const data = await redisUtils.callPromise('hgetall', socketId);
    return cb(null, data);
  } catch (setErr) {
    return cb(setErr);
  }
};

module.exports.setSocketIdByListId = async function setSocketByListId(userListId, targetSocketId, cb) {
  try {
    await redisUtils.callPromise('set', userListId, targetSocketId);
  } catch (err) {
    return cb(err);
  }

  try {
    await redisUtils.callPromise('expire', userListId, 60 * 60);
  } catch (err) {
    log.fatal({ err }, 'error setting ttl');
    return cb(err);
  }
};

module.exports.getSocketIdFromListId = async function getSocketIdFromListId(userListId, cb) {
  try {
    const socketId = await redisUtils.callPromise('get', userListId);
    return cb(null, socketId);
  } catch (err) {
    return cb(err);
  }
};

module.exports.makeUserOperator = makeUserOperator;

module.exports.checkOperatorPermissions = checkOperatorPermissions;

const filterRoomUser = function filterRoomUser(user) {
  return pick(user, [
    '_id',
    'handle',
    'operator_id',
    'user_id',
    'username',
    'isBroadcasting',
    'assignedBy',
    'isAdmin',
    'isSiteMod',
    'isSupporter',
    'userIcon',
    'color',
    'roles',
  ]);
};

const filterClientUser = function filterClientUser(user) {
  return omit(user, [
    'signature',
    'socket_id',
    'session_id',
    'ip',
    '__v',
    'auth',
    'attrs',
  ]);
};

module.exports.filterClientUser = filterClientUser;

module.exports.filterRoomUser = filterRoomUser;

module.exports.filterRoom = function filterRoom(room) {
  const filteredRoomUsers = room.users.map(user => filterRoomUser(user));

  const filteredRoomAttrs = pick(room.attrs, ['owner', 'janus_id', 'fresh', 'ageRestricted']);

  room.settings.requiresPassword = !!room.settings.passhash;

  const filteredSettings = pick(
    room.settings,
    [
      'public',
      'modOnlyPlayMedia',
      'forcePtt',
      'forceUser',
      'description',
      'topic',
      'display',
      'requiresPassword',
    ],
  );

  const filteredRoom = pick(room, ['_id', 'name', 'users', 'attrs']);
  filteredRoom.users = filteredRoomUsers;
  filteredRoom.attrs = filteredRoomAttrs;
  filteredRoom.settings = filteredSettings;

  return filteredRoom;
};

/**
 * add the `assignedBy` property to a moderator, if the moderator is a temp
 * mod. If the user is a permanent mod or a regular user, return the un-modified
 * user object.
 *
 * @param room
 * @returns {*}
 */
module.exports.checkModAssignedBy = function checkModAssignedBy(room) {
  return room.users.map((u) => {
    const mod = room.settings.moderators.find(m => String(m._id) === String(u.operator_id));

    if (mod && mod.assignedBy) {
      return Object.assign({}, u.toObject(), { assignedBy: mod.assignedBy });
    }

    return u.toObject();
  });
};

module.exports.getSocketIdFromRoom = function getSocketIdFromRoom(roomName, userListId, cb) {
  getRoomByName(roomName, (err, room) => {
    if (err) {
      log.fatal({ err }, 'error getting room');
      return cb(err);
    }

    if (!room) {
      log.error({ room: roomName }, 'room not found');
      return cb('ERR_NO_ROOM');
    }

    const user = room.users.find(u => String(u._id) === userListId);

    if (!user) {
      log.error('user not found');
      return cb('ERR_NO_USER');
    }

    return cb(null, {
      socketId: user.socket_id,
      userId: user.user_id,
    });
  });
};

module.exports.removeRoomByUserId = function removeRoomByUserId(userId, cb) {
  RoomModel
    .deleteOne({ 'attrs.owner': userId })
    .exec(cb);
};

function isIgnoreExpired({ expiresAt }) {
  const ignoreTime = new Date().getTime();
  const expireTime = new Date(expiresAt).getTime();
  return ignoreTime < expireTime;
}

module.exports.getIgnoredUsersInRoom = function getIgnoredUsersInRoom({ users }, ignoreList = []) {
  return ignoreList
    .filter(isIgnoreExpired)
    .map((i) => {
      const ignoredUser = users.find(user => i.sessionId === user.session_id);
      if (ignoredUser) {
        return {
          ...i,
          userListId: ignoredUser._id,
          handle: ignoredUser.handle,
        };
      }

      return i;
    })
    .map(i => omit(i, ['sessionId']));
};

module.exports.removeExpiredIgnoreListItems = function removeExpiredIgnoreListItems(ignoreList) {
  log.debug({ ignoreList }, 'removeExpiredIgnoreListItems');
  return ignoreList.filter(isIgnoreExpired);
};

module.exports.checkUserSilenced = async function checkUserSilenced(userListId) {
  const redisKey = `userSilence:${userListId}`;
  let silenced = false;

  try {
    silenced = await redisUtils.callPromise('get', redisKey);
  } catch (err) {
    throw err;
  }

  log.debug({ silenced }, 'user silenced');

  if (silenced) {
    try {
      const ttl = await redisUtils.callPromise('ttl', redisKey);

      if (ttl <= 0) {
        return false;
      }

      log.debug({ ttl }, 'user silenced');

      return ttl;
    } catch (err) {
      throw err;
    }
  }

  return false;
};

module.exports.addHistoryEntry = async function addHistoryEntry(roomId, user) {
  const room = await getRoomById(roomId);

  if (!room) {
    throw new NotFoundError(`Could not find room with ID: ${roomId}`);
  }

  return RoomHistoryModel
    .create({
      room: roomId,
      roomName: room.name,
      user,
    });
};

module.exports.getHistoryEntryByUserListId = function getHistoryEntryByUserListId(userListId) {
  return RoomHistoryModel
    .findOne({ 'user.userListId': userListId })
    .exec();
};

module.exports.getHistoryEntryByNames = function getHistoryEntryByNames(room, handle, username) {
  return RoomHistoryModel
    .findOne({ room })
    .or([
      { 'user.handle': handle },
      { 'user.username': username },
    ])
    .exec();
};

module.exports.addRecentRoom = async function addRecentRoom(userId, roomId) {
  log.debug({ userId: String(userId) }, 'addRecentRoom');
  const recent = await RecentRoomsModel
    .findOne({ user: userId })
    .exec();

  if (!recent) {
    return RecentRoomsModel
      .create({
        user: userId,
        rooms: [{ roomId }],
      });
  }

  const roomPromises = recent.rooms
    .map(r => RoomModel.countDocuments({ _id: r.roomId }).exec());

  try {
    const roomExists = await Promise.all(roomPromises);
    recent.rooms = recent.rooms.filter((roomId, i) => roomExists[i] === 1);
  } catch (err) {
    log.fatal({ err }, 'failed counting rooms');
    return Promise.reject(err);
  }

  let existingRoom = false;
  const rooms = recent.rooms
    .map(room => room.toObject())
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      if (aTime < bTime) return 1;
      if (aTime > bTime) return -1;
      return 0;
    })
    .map((room) => {
      if (room.roomId.equals(roomId)) {
        existingRoom = true;
        return {
          ...room,
          createdAt: new Date(),
        };
      }

      return room;
    });


  if (existingRoom) {
    recent.rooms = rooms;
    return recent.save();
  }

  if (rooms.length === 6) {
    recent.rooms = [
      { roomId },
      ...rooms.slice(0, 5),
    ];
  } else {
    recent.rooms = [
      { roomId },
      ...rooms,
    ];
  }

  return recent.save();
};


function checkUserIsMod(userId, room) {
  const { moderators } = room.settings;

  const isMod = moderators.some((m) => {
    const mod = userId === String(m.user_id);
    const isPerm = !m.assignedBy || String(m.assignedBy) === String(room.attrs.owner);
    return mod && isPerm;
  });

  const isOwner = String(room.attrs.owner) === userId;

  return isMod || isOwner;
}

module.exports.checkUserIsMod = checkUserIsMod;

module.exports.addToRemoveUserQueue = function addToRemoveUserQueue(socketId, roomName, cb) {
  return removeUserQueue.addToQueue([socketId, { name: roomName }, cb]);
};
