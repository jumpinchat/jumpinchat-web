/**
 * Created by vivaldi on 07/11/16.
 */

/* global window */

import {
  syncUser,
  getSession,
  checkCanBroadcast,
  updateSessionId,
} from './UserAPI';
import { syncYoutubeMessages } from './YoutubeAPI';
import {
  getRoom,
  joinRoom,
  syncMessages,
  syncUsers,
  syncClientEvents,
  syncErrors,
} from './RoomAPI';
import { init } from './CamUtil';

import SocketUtil from './SocketUtil';
import { error } from './ErrorUtil';
import { getStoredRoom } from '../actions/RoomActions';

import * as chatActions from '../actions/ChatActions';
import * as camActions from '../actions/CamActions';
import * as sessionActions from '../actions/SessionActions';
import { setHandleModal } from '../actions/ModalActions';
import { addNotification } from '../actions/NotificationActions';
import * as roleActions from '../actions/RoleActions';
import SessionStore from '../stores/SessionStore';
import ChatStore from '../stores/ChatStore/ChatStore';
import { ALERT_COLORS } from '../constants/AlertMap';
import {
  setBroadcastRestricted,
} from '../actions/UserActions';

function initJanus(janusId, roomName, userId) {
  init(janusId, roomName, userId, (camInitErr, initialized) => {
    if (camInitErr) {
      console.error(camInitErr, 'error from janus');
      if (camInitErr === 'ERR_DISCONNECT') {
        initJanus(janusId, roomName, userId);
      }
      return;
    }

    camActions.setCanBroadcast(initialized);
  });
}
export function connectToRoom(props) {
  syncUser();
  getRoom(props.room, (err, room) => {
    if (err) {
      addNotification({
        color: ALERT_COLORS.ERROR,
        message: 'Unable to connect to room',
      });
      return;
    }

    checkCanBroadcast(props.room, (err, canBroadcast) => {
      if (err) {
        addNotification({
          color: ALERT_COLORS.WARNING,
          message: 'Unable to broadcast',
        });
      }

      setBroadcastRestricted(!canBroadcast);
    });

    roleActions.fetchRoles(props.room);

    getStoredRoom(room);
    chatActions.setUserList(room.users);
    const { clientUser } = ChatStore.getState();
    let clientUserListId;
    if (clientUser) {
      console.log('got client user', clientUser._id);
      clientUserListId = clientUser._id;
    }

    joinRoom(room.name, props.user, clientUserListId, (joinErr, user) => {
      if (joinErr) {
        if (joinErr === 'ERR_USER_EXISTS') {
          console.warn('already joined the room');
          return;
        }

        console.error('error joining room', joinErr);
        addNotification({
          color: 'red',
          message: 'Error joining room',
          autoClose: false,
        });
        return;
      }

      console.log('rejoining room', user);

      chatActions.setClientUser(user);

      if (!clientUserListId) {
        console.log('reinitializing janus');
        initJanus(room.attrs.janus_id, room.name, user._id);
      }

      // open change handle modal to prompt
      // new user to change their handle
      setHandleModal(true);

      // start syncing messages
      syncMessages((msg) => {
        chatActions.addMessage(msg);
      });

      // sync room user list
      syncUsers();

      // sync client-specific events
      syncClientEvents();

      syncYoutubeMessages();
    });
  });
}

export function getRoomName() {
  const roomMatches = window.location.href.match(/((http|https):\/\/)?([\w\d.:]+)\/(\w+)/);
  const room = roomMatches[roomMatches.length - 1];
  return room;
}

function socketConnect(response, cb) {
  const room = getRoomName();

  sessionActions.setSessionId(SocketUtil.socket.id);
  cb(null, {
    loading: false,
    room,
    user: response.user,
    activityToken: response.token,
  });
}

export function reconnect(cb = () => {}) {
  const {
    id: oldSocketId,
    isReconnecting,
  } = SessionStore.getState();

  if (isReconnecting) {
    return cb();
  }

  // get the old session ID and
  sessionActions.setIsReconnecting(true);
  return updateSessionId(oldSocketId, SocketUtil.socket.id, (err) => {
    if (err) {
      console.error(err);
      console.log('failed to update session ID');
      camActions.setCanBroadcast(false);

      error({
        context: 'chat',
        message: 'unable to reconnect to room, please refresh',
      });

      sessionActions.setIsReconnecting(false);
      return cb('ERR_RECONNECT_FAIL');
    }

    // save new socket id
    sessionActions.setSessionId(SocketUtil.socket.id);

    camActions.setCanBroadcast(true);

    addNotification({
      color: 'blue',
      message: 'Chat server reconnected',
    });

    sessionActions.setIsReconnecting(false);
    return cb();
  });
}

export function initRoom(cb) {
  let disconnectTimeout;
  getSession((err, response) => {
    if (err) {
      return addNotification({
        color: 'red',
        message: 'Unable to get session',
        autoClose: false,
      });
    }

    SocketUtil.authSocket(response.token);

    SocketUtil.listen('connect', () => socketConnect(response, cb));

    SocketUtil.listen('reconnect', () => {
      console.log('socket reconnected');
      clearTimeout(disconnectTimeout);
      return reconnect(cb);
    });

    SocketUtil.listen('disconnect', () => {
      console.log('socket disconnected');

      camActions.setCanBroadcast(false);
      addNotification({
        color: 'yellow',
        message: 'Chat server disconnected',
      });

      disconnectTimeout = setTimeout(() => {
        window.location.reload();
      }, 1000 * 60);
    });

    SocketUtil.listen('error', (err) => {
      console.error(err);

      camActions.setCanBroadcast(false);
      addNotification({
        color: 'red',
        message: 'Unable to establish connection to chat server',
        autoClose: false,
      });
    });

    syncErrors((err) => {
      error(err);
    });
  });
}

export default null;
