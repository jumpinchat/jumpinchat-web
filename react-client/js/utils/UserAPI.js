/* global window, Raven */
import request from 'superagent';
import Fingerprint from '@fingerprintjs/fingerprintjs';
import { trackEvent } from './AnalyticsUtil';
import SocketUtil from './SocketUtil';
import {
  logUserIn,
  setUserInfo,
  setHandleError,
  changeHandle as changeHandleAction,
  setUnreadMessages,
  setBroadcastQuality,
} from '../actions/UserActions';

import { setQualityOptions } from '../actions/CamActions';

import { setHandleModal } from '../actions/ModalActions';
import {
  setProfile,
  setLoading as setProfileLoading,
} from '../actions/ProfileActions';
import { addNotification } from '../actions/NotificationActions';
import { ALERT_COLORS } from '../constants/AlertMap';


const events = {
  CHANGE_HANDLE: 'room::handleChange',
  CLIENT_HANDLE: 'client::handleChange',
  USER_DATA: 'self::user',
};

function getFingerprint() {
  return new Promise(async (resolve, reject) => {
    try {
      const fp = await Fingerprint.load();
      const result = await fp.get();
      return resolve(result.visitorId);
    } catch (err) {
      return reject(err);
    }
  });
}

export function checkCanBroadcast(room, cb) {
  const url = `/api/user/checkCanBroadcast${room ? `/${room}` : ''}`;
  return request
    .get(url)
    .end((err, response, body) => {
      if (err) {
        if (response) {
          if (response.statusCode === 403) {
            if (response.text === 'ERR_BROADCAST_BAN') {
              addNotification({
                color: ALERT_COLORS.WARNING,
                message: 'You are banned from broadcasting',
                autoClose: false,
              });
            }

            if (response.text === 'ERR_AGE_RESTRICTED') {
              addNotification({
                color: ALERT_COLORS.INFO,
                message: 'You need to be age verified to broadcast',
                action: {
                  type: 'link',
                  payload: '/ageverify',
                },
                autoClose: false,
              });
            }


            return cb(null, false);
          }

          if (response.statusCode >= 400) {
            addNotification({
              color: ALERT_COLORS.WARNING,
              message: 'Unable to broadcast',
            });
            return cb(true);
          }
        }


        addNotification({
          color: ALERT_COLORS.WARNING,
          message: 'Unable to broadcast',
        });

        return cb(err);
      }

      if (response.body && response.body.videoOptions) {
        setQualityOptions(response.body.videoOptions);
      }

      return cb(null, true);
    });
}

export async function getSession(cb) {
  let fp;
  try {
    fp = await getFingerprint();
  } catch (err) {
    console.error(err);
  }

  try {
    request
      .post('/api/user/session', { fp })
      .end((err, response) => {
        if (err) {
          console.error(err);
          return cb(err);
        }

        if (response.body.user) {
          const { user } = response.body;
          logUserIn(user);
          if (window.Raven) {
            window.Raven.setUserContext({
              id: user.user_id,
            });
          }
        }

        return cb(null, response.body);
      });
  } catch (err) {
    return cb(err);
  }
}

export function updateSessionId(oldId, newId, cb) {
  if (!oldId) {
    return cb('no existing socket');
  }

  const prefixedOldId = `${oldId}`;
  const prefixedNewId = `${newId}`;
  let retryCount = 5;

  const updateReq = () => request
    .put(`/api/user/socket/old/${encodeURIComponent(prefixedOldId)}/new/${encodeURIComponent(prefixedNewId)}`)
    .end((err, response) => {
      if (err || response.statusCode >= 400) {
        console.warn('reconnect attempts left ', retryCount);
        if (retryCount > 0) {
          console.warn('reconnect failed, retrying');
          setTimeout(updateReq, 2000);
          retryCount -= 1;
          return false;
        }

        console.error(err);
        return cb('ERR_NO_SESSION');
      }

      return cb(null);
    });

  return updateReq();
}

export function syncUser() {
  SocketUtil.listen(events.USER_DATA, (msg) => {
    setUserInfo(msg.user);
  });

  SocketUtil.listen(events.CLIENT_HANDLE, (msg) => {
    changeHandleAction(msg);
    setHandleModal(false);
  });
}

export function changeHandle(newHandle) {
  trackEvent('Chat', 'Change user handle');

  SocketUtil.emit(events.CHANGE_HANDLE, { handle: newHandle });

  SocketUtil.listen('client::error', (msg) => {
    if (msg.context === 'handle-change') {
      setHandleModal(true);
      setHandleError(msg.error);
    }
  });
}

export function setVerifyReminded() {
  request
    .post('/api/user/hasremindedverify')
    .end((err) => {
      if (err) {
        console.error(err);
      }
    });
}

export function setNotificationsEnabled(userId, enabled) {
  if (!userId) {
    return false;
  }

  return request
    .put(`/api/user/${userId}/setnotifications`, { enabled })
    .end((err) => {
      if (err) {
        console.error(err);
      }
    });
}

export function setThemeRequest(userId, darkTheme) {
  request
    .put(`/api/user/${userId}/theme?dark=${darkTheme}`)
    .end((err) => {
      if (err) {
        console.error(err);
      }
    });
}

export function getUserProfile(userId) {
  return request
    .get(`/api/user/${userId}/profile`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error fetching user profile',
        });
      }

      if (response.statusCode >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error fetching user profile',
        });
      }

      setProfileLoading(false);
      return setProfile(response.body, false);
    });
}

export function getUnreadMessages(userId) {
  return request
    .get(`/api/message/${userId}/unread`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error fetching unread messages',
        });
      }

      if (response.statusCode >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error fetching unread messages',
        });
      }

      return setUnreadMessages(response.body.unread);
    });
}

export function saveBroadcastQuality(quality) {
  return request
    .put(`/api/user/setBroadcastQuality?quality=${quality}`)
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error saving quality settings',
        });
      }

      if (response.statusCode >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error saving quality settings',
        });
      }

      return setBroadcastQuality(response.body);
    });
}
