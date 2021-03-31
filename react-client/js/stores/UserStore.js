/**
 * Created by Zaccary on 20/06/2015.
 */

import { EventEmitter } from 'events';
import { UserDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';
import { set, get } from '../utils/localStorage';

const STORAGE_KEY_HANDLE = 'handle';
const STORAGE_KEY_THEME_DARK = 'darkTheme';
const STORAGE_KEY_VIDEOS = 'playYtVideos';

export class UserStore extends EventEmitter {
  constructor() {
    super();

    this.state = {
      broadcastRestricted: true,
      user: {
        user_id: null,
        handle: null,
        hasChangedHandle: false,
        is_client_user: true,
        restoredHandle: null,
        settings: {
          darkTheme: false,
          playYtVideos: true,
          pushNotificationsEnabled: true,
        },
        roles: [],
      },
      unreadMessages: 0,
    };

    this._activityToken = null;
  }

  setUser(user) {
    let { darkTheme, playYtVideos, pushNotificationsEnabled } = this.state.user.settings;

    const restoredHandle = get(STORAGE_KEY_HANDLE) || null;

    if (!this.state.user.user_id && !user.user_id) {
      darkTheme = get(STORAGE_KEY_THEME_DARK) || false;
    }

    if (!this.state.user.user_id && !user.user_id) {
      const storedPlayVideos = get(STORAGE_KEY_VIDEOS);
      playYtVideos = storedPlayVideos !== null ? storedPlayVideos : true;
    }

    this.state = {
      ...this.state,
      user: {
        ...this.state.user,
        ...user,
        restoredHandle,
        settings: {
          ...this.state.user.settings,
          darkTheme,
          playYtVideos,
          ...user.settings,
        },
      },
    };
  }

  setActivityToken(token) {
    this._activityToken = token;
  }

  setNotificationsEnabled(pushNotificationsEnabled) {
    this.state = {
      ...this.state,
      user: {
        ...this.state.user,
        settings: {
          ...this.state.user.settings,
          pushNotificationsEnabled,
        },
      },
    };
  }

  changeHandle(handleObject) {
    this.state = {
      ...this.state,
      user: {
        ...this.state.user,
        handle: handleObject.handle,
        hasChangedHandle: true,
        restoredHandle: null,
      },
    };

    set(STORAGE_KEY_HANDLE, handleObject.handle);
  }

  setBroadcastRestricted(broadcastRestricted) {
    this.state = {
      ...this.state,
      broadcastRestricted,
    };
  }

  setTheme(darkTheme) {
    this.state = {
      ...this.state,
      user: {
        ...this.state.user,
        settings: {
          ...this.state.user.settings,
          darkTheme,
        },
      },
    };

    if (!this.state.user.user_id) {
      set(STORAGE_KEY_THEME_DARK, darkTheme);
    }
  }

  setUnreadMessages(unreadMessages) {
    this.state = {
      ...this.state,
      unreadMessages,
    };
  }

  setBroadcastQuality(videoQuality) {
    this.state = {
      ...this.state,
      user: {
        ...this.state.user,
        videoQuality,
      },
    };
  }

  setPlayVideos(playYtVideos) {
    this.state = {
      ...this.state,
      user: {
        ...this.state.user,
        settings: {
          ...this.state.user.settings,
          playYtVideos,
        },
      },
    };

    if (!this.state.user.user_id) {
      set(STORAGE_KEY_VIDEOS, playYtVideos);
    }
  }

  getState() {
    return this.state;
  }

  // Emit Change event
  emitChange() {
    this.emit('change');
  }

  // Add change listener
  addChangeListener(callback) {
    this.on('change', callback);
  }

  // Remove change listener
  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}

const userStore = new UserStore();

UserDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case types.USER_SET:
      userStore.setUser(action.data);
      break;
    case types.USER_LOG_IN:
      userStore.setUser(action.data);
      break;
    case types.USER_ACT_TOKEN_SET:
      userStore.setUser(action.data);
      break;
    case types.USER_SET_NOTIFICATIONS:
      userStore.setNotificationsEnabled(action.enabled);
      break;
    case types.CLIENT_UPDATE_HANDLE:
      userStore.changeHandle(action.data);
      break;
    case types.SET_BROADCAST_RESTRICTED:
      userStore.setBroadcastRestricted(action.broadcastRestricted);
      break;
    case types.USER_SET_THEME:
      userStore.setTheme(action.darkTheme);
      break;
    case types.USER_SET_UNREAD_MESSAGES:
      userStore.setUnreadMessages(action.unread);
      break;
    case types.USER_SET_BROADCAST_QUALITY:
      userStore.setBroadcastQuality(action.quality);
      break;
    case types.USER_SET_PLAY_VIDEOS:
      userStore.setPlayVideos(action.playVideos);
      break;
    default:
      return true;
  }

  userStore.emitChange();

  return true;
});

export default userStore;
