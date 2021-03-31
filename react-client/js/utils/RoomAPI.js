/* global window */

import request from 'superagent';
import uuid from 'uuid';
import { trackEvent } from './AnalyticsUtil';
import SocketUtil from './SocketUtil';

import { setVerifyReminded } from './UserAPI';
import * as roomActions from '../actions/RoomActions';
import * as chatActions from '../actions/ChatActions';
import * as pmActions from '../actions/PmActions';
import PmStore from '../stores/PmStore/PmStore';
import { unpublishOwnFeed } from './CamUtil';
import { initPushNotifications } from './ServiceWorkerUtils';
import {
  getRoomName,
  reconnect,
} from './RoomUtils';
import { addNotification } from '../actions/NotificationActions';
import {
  ALERT_COLORS,
  ALERT_TYPES,
} from '../constants/AlertMap';

import { setUserInfo } from '../actions/UserActions';

import {
  setHandleModal,
  setModalError,
} from '../actions/ModalActions';

const events = {
  JOIN: 'room::join',
  ROOM_UPDATE_USERS: 'room::updateUsers',
  ROOM_GET_USERS: 'room::users',
  ROOM_MESSAGE: 'room::message',
  PRIVATE_MESSAGE: 'room::privateMessage',
  SYNC_ROOM_STATUS: 'room::status',
  SYNC_SELF_STATUS: 'self::status',
  USER_CHANGE_HANDLE: 'room::handleChange',
  USER_DISCONNECT: 'room::disconnect',
  USER_JOIN: 'room::join',
  USER_UPDATE_USERLIST: 'room::updateUserList',
  USER_UPDATE: 'room::updateUser',
  ROOM_OPERATION: 'room::operation',
  ROOM_COMMAND: 'room::command',
  CLIENT_BANLIST: 'client::banlist',
  CLIENT_CHANGE_HANDLE: 'client::handleChange',
  SELF_JOIN: 'self::join',
  SELF_ALERT: 'self::alert',
  SELF_BANNED: 'self::banned',
  SELF_BROADCAST_CLOSED: 'self::closeBroadcast',
  CLIENT_FORCE_DISCONNECT: 'client::forceDisconnect',
  ROOM_STILL_JOINED: 'room::isStillJoined',
  ROOM_IGNORE_USER: 'room::ignoreUser',
  ROOM_UNIGNORE_USER: 'room::unignoreUser',
  ROOM_UPDATE_IGNORE: 'room::updateIgnore',
  ROOM_GET_IGNORE: 'room::getIgnoreList',
  ROOM_FEED_CLEAR: 'room::clearFeed',
  ROOM_SET_TOPIC: 'room::setTopic',
  ROOM_SETTINGS: 'room::settings',
};

const checkJoinedTimer = 1000 * 60 * 5;

export function setInfoRead(roomId) {
  request
    .put(`/api/rooms/${roomId}/inforead`)
    .end((err) => {
      if (err) {
        console.error({ err });
        addNotification({
          color: ALERT_COLORS.WARNING,
          message: 'Failed to update room',
        });
      }
    });
}

export function joinRoom(room, user, userListId, cb) {
  const userJoinData = {
    room,
    userListId,
  };

  if (user) {
    userJoinData.user = user;
  }

  SocketUtil.emit(events.USER_JOIN, userJoinData);

  SocketUtil.listen(events.USER_JOIN, (msg) => {
    chatActions.addUser(msg.user);
  });

  SocketUtil.listen(events.USER_UPDATE_USERLIST, (msg) => {
    chatActions.updateUserList(msg.user);
    SocketUtil.emit(events.ROOM_GET_IGNORE, { roomName: room });
  });

  SocketUtil.listen(events.SELF_JOIN, (msg) => {
    setUserInfo(msg.user);
    initPushNotifications(SocketUtil.socket.id);
    setInterval(() => SocketUtil.emit(events.ROOM_STILL_JOINED, { room }), checkJoinedTimer);
    SocketUtil.emit(events.ROOM_GET_USERS);
    cb(null, msg.user);
  });

  SocketUtil.listen(events.CLIENT_CHANGE_HANDLE, () => {
    setHandleModal(false);
  });

  SocketUtil.listen(events.SELF_BANNED, () => {
    window.location.reload();
  });

  SocketUtil.listen(events.ROOM_FEED_CLEAR, () => {
    chatActions.clearMessages();
  });

  SocketUtil.listen(events.SELF_BROADCAST_CLOSED, () => {
    unpublishOwnFeed();
  });

  SocketUtil.listen(events.CLIENT_FORCE_DISCONNECT, () => {
    reconnect((err) => {
      if (err) {
        window.location.reload();
      }
    });
  });

  SocketUtil.listen(
    events.ROOM_UPDATE_IGNORE,
    ({ ignoreList }) => chatActions.updateIgnoreList(ignoreList),
  );

  SocketUtil.listen(
    events.ROOM_UPDATE_USERS,
    ({ users }) => chatActions.setUserList(users),
  );

  SocketUtil.listen(events.SELF_ALERT, (msg) => {
    const {
      action,
      type,
      message,
      level,
      timeout,
      id,
    } = msg;

    setTimeout(() => {
      switch (type) {
        case ALERT_TYPES.BANNER:
          return addNotification({
            color: ALERT_COLORS[level],
            message,
            action,
            autoClose: false,
          });
        default:
      }
    }, timeout ? msg.timeout * 1000 : 0);

    if (id && id === 'remindNotify') {
      setVerifyReminded();
    }
  });
}

export function syncMessages(cb) {
  SocketUtil.listen(events.ROOM_MESSAGE, msg => cb(msg));
  SocketUtil.listen(events.PRIVATE_MESSAGE, msg => pmActions.addPrivateMessage(msg));

  SocketUtil.listen(events.SYNC_ROOM_STATUS, (msg) => {
    if (msg.message) {
      cb(Object.assign({}, msg, { status: true }));
    }
  });

  SocketUtil.listen(events.SYNC_SELF_STATUS, (msg) => {
    if (msg.message) {
      cb(Object.assign({}, msg, { status: true }));
    }
  });


  SocketUtil.listen(events.ROOM_SETTINGS, (msg) => {
    roomActions.setRoomSettings(msg);
  });
}

export function syncUsers() {
  SocketUtil.listen(events.USER_CHANGE_HANDLE, (msg) => {
    chatActions.updateUserHandle(msg);
    setModalError(null);
  });

  SocketUtil.listen(events.USER_DISCONNECT, (msg) => {
    chatActions.removeUser(msg.user);
    pmActions.removeConversation(msg.user._id);
  });

  SocketUtil.listen(events.USER_UPDATE, msg => chatActions.updateUser(msg.user));
}

export function syncErrors(cb) {
  SocketUtil.listen('client::error', cb);
}

export function syncClientEvents() {
  SocketUtil.listen('client::banlist', (msg) => {
    chatActions.setBanlist(msg.list);
  });
}

export function sendCommand(room, command, value = null) {
  trackEvent('Chat', 'Send chat command', `${command} ${value}`);
  const message = {
    command,
  };

  if (value) {
    message.value = value;
  }

  SocketUtil.emit(events.ROOM_COMMAND, { message, room });
}

export function sendMessage(message, room, pm = false) {
  if (!pm) {
    chatActions.sendChatMessage(message);
  }

  if (message.trim()[0] === '/') {
    const re = /\/([a-z?]+)(.+)?/;
    const commandArr = re.exec(message);

    if (commandArr) {
      return sendCommand(room, commandArr[1], commandArr[2]);
    }
  }

  const event = pm ? events.PRIVATE_MESSAGE : events.ROOM_MESSAGE;
  return SocketUtil.emit(event, { message, room });
}

/**
 * @param {string} message
 * @param {string} room - the name of the current room
 * @param {string} userListId - the user list ID of the recipient
 */
export function sendPrivateMessage(message, room, userListId) {
  SocketUtil.emit(events.PRIVATE_MESSAGE, { message, room, userListId });
}

/**
 * Send an operator action
 *
 * @param {string} action - operator action to perform
 * @param {object} [additionalData] - additional data to send
 */
export function sendOperatorAction(action, additionalData) {
  trackEvent('Chat', 'Operator action', action);
  let msg = {};

  if (additionalData) {
    msg = Object.assign(msg, additionalData);
  }

  SocketUtil.emit(`${events.ROOM_OPERATION}::${action}`, msg);
}

export function sendUserBroadcastState(isBroadcasting) {
  SocketUtil.emit('room::setUserIsBroadcasting', { isBroadcasting });
}

export function setChatColor(color) {
  trackEvent('Chat', 'Set chat color');
  SocketUtil.emit('room::changeColor', { color });
}

function createVideoScreenshot(targetId) {
  const video = document.getElementById(targetId);
  if (!video) {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg');
}

export function sendReport(room, reporterId, targetId, reason, description, messages) {
  const body = {
    room,
    reporterId,
    targetId,
    reason,
    description,
    screenshotUri: createVideoScreenshot(targetId),
    messages,
    privateMessages: PmStore.getConversation(targetId),
  };

  request
    .post('/api/report', body)
    .end((err, response) => {
      if (response.statusCode >= 400) {
        trackEvent('Error', 'User report', response.statusCode);
        if (response.body) {
          const { message } = response.body;

          if (response.statusCode === 429) {
            return chatActions.addMessage({
              message,
              id: uuid.v4(),
              timestamp: Date.now(),
              status: true,
              type: 'warning',
            });
          }

          return addNotification({
            color: ALERT_COLORS.WARNING,
            message,
          });
        }

        return addNotification({
          color: ALERT_COLORS.WARNING,
          message: 'Failed to send report',
        });
      }

      if (err) {
        console.error({ err });
        return addNotification({
          color: ALERT_COLORS.WARNING,
          message: 'Failed to send report',
        });
      }


      return addNotification({
        color: ALERT_COLORS.SUCCESS,
        message: 'Report sent successfully',
      });
    });
}

export function submitRoomPassword(room, password, cb) {
  return request
    .post(`/api/rooms/${room}/password`, { password })
    .end((err, response) => {
      if (err) {
        return cb(err.response.body);
      }

      if (response.statusCode >= 400) {
        return cb(response.body);
      }

      return cb();
    });
}

export function submitAgeConfirm(cb) {
  return request
    .post('/api/rooms/confirmAge', {})
    .end((err, response) => {
      if (err) {
        return cb(err.response.body);
      }

      if (response.statusCode >= 400) {
        return cb(response.body);
      }

      return cb();
    });
}

export function getCustomEmoji() {
  return new Promise((resolve, reject) => request
    .get(`/api/rooms/${getRoomName()}/emoji`)
    .end((err, response) => {
      if (err) {
        return reject(err.response.body);
      }

      if (response.statusCode >= 400) {
        return reject(response.body);
      }

      return resolve(response.body);
    }));
}


export function ignoreUser(userListId) {
  console.log({ userListId }, 'ignore user');
  trackEvent('Chat', 'Ignore user');
  SocketUtil.emit(events.ROOM_IGNORE_USER, { userListId, roomName: getRoomName() });
}

export function unignoreUser(id) {
  console.log({ ignoreItemId: id }, 'unignore user');
  trackEvent('Chat', 'Unignore user');
  SocketUtil.emit(events.ROOM_UNIGNORE_USER, { id });
}

export function getRoom(room, cb) {
  request
    .get(`/api/rooms/${room}`)
    .end(async (err, response) => {
      if (err) {
        return cb(err);
      }

      try {
        const emoji = await getCustomEmoji();
        chatActions.setRoomEmoji(emoji);
      } catch (err) {
        addNotification({
          color: ALERT_COLORS.WARNING,
          message: 'Failed fetch emoji',
        });
      }

      return cb(null, response.body);
    });
}

export function setTopic(topic) {
  SocketUtil.emit(events.ROOM_SET_TOPIC, { topic });
}
