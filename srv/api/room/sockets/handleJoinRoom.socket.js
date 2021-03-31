/**
 * Created by Zaccary on 24/05/2016.
 */

const jwt = require('jsonwebtoken');
const moment = require('moment');
const log = require('../../../utils/logger.util')({ name: 'handleJoinRoom.socket' });
const utils = require('../../../utils/utils');
const RoomJoin = require('../controllers/room.join');
const RoomUtils = require('../room.utils');
const userUtils = require('../../user/user.utils');
const {
  ALERT_TYPES,
  ALERT_LEVELS,
} = require('../../../config/constants/alerts');
const errors = require('../../../config/constants/errors');

const joinConditions = [
  'ERR_ACCOUNT_REQUIRED',
  'ERR_PASSWORD_REQUIRED',
  'ERR_USER_BANNED',
  'ERR_AGE_WARNING',
  'ERR_ROOM_CLOSED',
  'ERR_KICKED',
  'ERR_VERIFIED_EMAIL_REQUIRED',
  'ERR_MIN_ACCOUNT_AGE',
];

module.exports = function handleJoinRoomSocket(socket, io) {
  const roomJoin = new RoomJoin();

  return function handleJoinRoom(msg) {
    // join the socket room
    socket.join(msg.room);

    let ip;
    if (socket.handshake.headers['x-forwarded-for']) {
      ip = socket.handshake.headers['x-forwarded-for']
        .split(',')
        .map(s => s.trim())[0];
    } else {
      ip = socket.handshake.address;
    }

    // create guest handle for new user
    // attach socket info
    const user = {
      ip,
      session_id: jwt.decode(socket.handshake.query.token).session,
      handle: RoomUtils.createGuestHandle(),
      socket_id: socket.id,
      user_id: socket.handshake.signedCookies['jic.ident'] || null,
    };

    // add user to the room
    const { cookie } = socket.handshake.headers;
    const { session } = socket.handshake;

    return roomJoin.join(msg.room, user, msg.userListId, { session, cookie }, async (err, room) => {
      if (err) {
        if (joinConditions.includes(err.error)) {
          log.debug({ err }, 'dialog error condition');
          socket.emit(
            'client::error',
            {
              context: 'dialog',
              error: err.error,
              body: err.body,
            },
          );

          try {
            await utils.destroySocketConnection(io, socket.id);
            return true;
          } catch (err) {
            log.fatal({ err }, 'failed to destroy socket connection');
            return false;
          }
        }

        if (err.message === 'ERR_USER_EXISTS') {
          log.error({ err }, 'user attempted to join the room twice');
          return socket.emit(
            'client::error',
            {
              context: 'chat',
              error: 'You have already joined this room',
            },
          );
        }

        log.fatal({ err, room: msg.room }, 'error joining room');

        return socket.emit('client::error',
          {
            context: 'alert',
            message: 'Error joining room',
          });
      }

      if (room.error) {
        log.warn(room.error);
        return socket.emit('client::error',
          {
            context: 'alert',
            message: 'You are banned from this room',
          });
      }

      let newUser = room.users.find(roomUser => socket.id === roomUser.socket_id);
      if (!newUser) {
        return socket.emit('client::error', {
          context: 'alert',
          message: 'Error joining room',
        });
      }

      newUser = newUser.toObject();

      // if user is an operator, add their
      // permissions to the user obj
      if (newUser.operator_id) {
        const newUserMod = room.settings.moderators
          .find(mod => String(mod._id) === newUser.operator_id);

        newUser.operatorPermissions = newUserMod.permissions;

        if (newUserMod.assignedBy) {
          newUser.assignedBy = newUserMod.assignedBy;
        }
      }

      if (newUser.isAdmin) {
        newUser.operatorPermissions = {
          ban: true,
          close_cam: true,
          mute_user_audio: true,
          mute_user_chat: true,
          mute_room_chat: true,
          mute_room_audio: true,
          apply_password: true,
          assign_operator: true,
        };
      }

      if (newUser.isSiteMod) {
        newUser.operatorPermissions = {
          ban: true,
          close_cam: true,
          mute_user_audio: true,
          mute_user_chat: true,
          mute_room_chat: true,
          mute_room_audio: true,
          apply_password: false,
          assign_operator: false,
        };
      }


      // TODO: do this less frequently
      RoomUtils.clearEmptyJanusRooms((err) => {
        if (err) {
          log.fatal({ err }, 'error clearing empty janus rooms');
        }
      });


      // send a socket with the new user's details to the room,
      // to allow updating the data in the user list
      io.to(room.name).emit('room::updateUserList', {
        user: RoomUtils.filterRoomUser(RoomUtils.filterClientUser(newUser)),
      });

      const { ignoreList } = socket.handshake.session;
      socket.emit('room::updateIgnore', {
        ignoreList: RoomUtils.getIgnoredUsersInRoom(room, ignoreList),
      });

      // send a message to the room chat window
      // with the notification
      const joinMsg = {
        notification_type: 'room',
        message: `guest ${newUser.handle} has joined the room`,
        timestamp: new Date(),
      };

      socket.emit('self::join', { user: RoomUtils.filterClientUser(newUser) });

      if (newUser.user_id) {
        userUtils.getUserById(newUser.user_id, (err, userDoc) => {
          if (err) {
            log.fatal({ err }, 'error getting user');
            return socket.emit(
              'client::error', utils.messageFactory({
                context: 'chat',
                ...errors.ERR_SRV,
              }),
            );
          }

          if (!userDoc) {
            log.error({ userId: newUser.user_id }, 'no user');
            return socket.emit(
              'client::error', utils.messageFactory({
                context: 'chat',
                ...errors.ERR_NO_USER,
              }),
            );
          }

          const verifyReminderCookie = utils.getCookie('jic.verifyReminder', socket.handshake.headers.cookie);

          if (!userDoc.auth.email_is_verified && !verifyReminderCookie) {
            socket.emit(
              'self::alert',
              utils.createNotification(
                ALERT_TYPES.BANNER,
                ALERT_LEVELS.INFO,
                'Remember to verify your email',
                {
                  timeout: 10,
                  action: {
                    type: 'link',
                    payload: '/settings/account',
                  },
                  id: 'remindNotify',
                },
              ),
            );
          }
        });
      }

      let welcomeMessages = [
        `Welcome to ${msg.room}`,
      ];

      if (room.settings.description) {
        welcomeMessages = [
          ...welcomeMessages,
          `Room description: ${room.settings.description}`,
          ' ',
        ];
      }

      if (room.settings.topic.text) {
        welcomeMessages = [
          ...welcomeMessages,
          `Room topic: ${room.settings.topic.text}`,
          `Set by: ${room.settings.topic.updatedBy && room.settings.topic.updatedBy.username} ${moment(room.settings.topic.updatedAt).format('DD/MM/YYYY')}`,
          ' ',
        ];
      }

      welcomeMessages = [
        ...welcomeMessages,
        'You can find help for available chat commands by typing "/help"',
      ];

      if (newUser.operator_id) {
        welcomeMessages = [
          ...welcomeMessages,
          'You can also list moderator commands by typing "/modhelp"',
        ];
      }

      if (room.users.length === 1) {
        welcomeMessages = [
          ...welcomeMessages,
          ' ',
          'There\'s nobody here right now, you can invite people by sharing the link above',
          ' ',
        ];
      }

      welcomeMessages
        .map(message => ({ message }))
        .forEach((message) => {
          socket.emit('room::status', utils.messageFactory(message));
        });

      return io.to(msg.room).emit('room::status', utils.messageFactory(joinMsg));
    });
  };
};
