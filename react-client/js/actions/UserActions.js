/**
 * Created by Zaccary on 20/06/2015.
 */

import {
  UserDispatcher,
  CamDispatcher,
} from '../dispatcher/AppDispatcher';

import * as types from '../constants/ActionTypes';

export function setUserInfo(user) {
  UserDispatcher.handleAction({
    actionType: types.USER_SET,
    data: user,
  });
}

export function setActivityToken(token) {
  UserDispatcher.handleAction({
    actionType: types.USER_ACT_TOKEN_SET,
    data: token,
  });
}

export function changeHandle(handle) {
  UserDispatcher.handleAction({
    actionType: types.CLIENT_UPDATE_HANDLE,
    data: handle,
  });

  CamDispatcher.handleAction({
    actionType: types.CLIENT_UPDATE_HANDLE,
  });
}

export function closeHandleModal() {
  UserDispatcher.handleAction({
    actionType: types.HANDLE_MODAL_CLOSE,
  });
}

export function openHandleModal() {
  UserDispatcher.handleAction({
    actionType: types.HANDLE_MODAL_OPEN,
  });
}

export function setHandleError(error) {
  UserDispatcher.handleAction({
    actionType: types.HANDLE_MODAL_ERROR,
    data: error,
  });
}

export function openAccountModal() {
  UserDispatcher.handleAction({
    actionType: types.ACCOUNT_MODAL_STATE,
    open: true,
  });
}

export function closeAccountModal() {
  UserDispatcher.handleAction({
    actionType: types.ACCOUNT_MODAL_STATE,
    open: false,
  });
}

export function logUserIn(userDetails) {
  UserDispatcher.handleAction({
    actionType: types.USER_LOG_IN,
    data: userDetails,
  });
}

export function setNotificationsEnabled(enabled) {
  UserDispatcher.handleAction({
    actionType: types.USER_SET_NOTIFICATIONS,
    enabled,
  });
}

export function setBroadcastRestricted(broadcastRestricted) {
  UserDispatcher.handleAction({
    actionType: types.SET_BROADCAST_RESTRICTED,
    broadcastRestricted,
  });
}

export function setTheme(darkTheme) {
  UserDispatcher.handleAction({
    actionType: types.USER_SET_THEME,
    darkTheme,
  });
}

export function setUnreadMessages(unread) {
  UserDispatcher.handleAction({
    actionType: types.USER_SET_UNREAD_MESSAGES,
    unread,
  });
}


export function setBroadcastQuality(quality) {
  UserDispatcher.handleAction({
    actionType: types.USER_SET_BROADCAST_QUALITY,
    quality,
  });
}

export function setPlayVideos(playVideos) {
  UserDispatcher.handleAction({
    actionType: types.USER_SET_PLAY_VIDEOS,
    playVideos,
  });
}
