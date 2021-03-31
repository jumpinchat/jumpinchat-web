/* global Notification, navigator, window */

import request from 'superagent';
import {
  setManager,
} from '../actions/PushActions';
import { addNotification } from '../actions/NotificationActions';
import { trackEvent } from './AnalyticsUtil';
import SocketUtil from './SocketUtil';
import UserStore from '../stores/UserStore';
import { setNotificationsEnabled } from './UserAPI';
import { setNotificationsEnabled as setNotificationsEnabledAction } from '../actions/UserActions';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function generateKeys(subscription) {
  const rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
  const key = rawKey
    ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey)))
    : '';

  const rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';

  const authSecret = rawAuthSecret
    ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret)))
    : '';

  return { key, authSecret };
}

function fetchPushKey() {
  return new Promise((resolve, reject) => {
    request
      .get('/api/rooms/push/publickey')
      .end((err, response) => {
        if (err) {
          return reject(err);
        }

        return resolve(urlB64ToUint8Array(response.body.key));
      });
  });
}

export function setRoomName(roomName) {
  navigator.serviceWorker.controller.postMessage({ context: 'setRoom', message: roomName });
}

function getPushSubscription(registration) {
  return Promise.all([
    fetchPushKey(),
    registration.pushManager.getSubscription(),
  ])
    .then(([key, subscription]) => {
      if (subscription) {
        return subscription;
      }

      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    })
    .then((subscription) => {
      setManager(subscription);
      return subscription;
    })
    .catch((err) => {
      trackEvent('Service Worker', 'Push register', 'failed');
      console.error({ err }, 'Push registration failed');
    });
}

function getRegistration() {
  if (!navigator.serviceWorker) {
    return Promise.reject();
  }

  return navigator.serviceWorker.ready;
}
function getSubscription() {
  if (!navigator.serviceWorker) {
    return Promise.reject();
  }

  return navigator.serviceWorker.ready
    .then(registration => registration.pushManager.getSubscription());
}

export function registerPushNotifications() {
  if (Notification.permission === 'denied') {
    console.log('permission blocked');
    return Notification.requestPermission((status) => {
      trackEvent('Service Worker', 'Push permissions', status);
      console.log(status, 'attempted to ask for permissions');
      if (status === 'granted') {
        return registerPushNotifications();
      }
    });
  }

  return getRegistration()
    .then(registration => getPushSubscription(registration))
    .then((subscription) => {
      if (!subscription) {
        console.error('Push subscription missing');
        return;
      }

      const { endpoint } = subscription;
      const socketId = SocketUtil.socket.id;

      const { key, authSecret } = generateKeys(subscription);

      request
        .post(`/api/rooms/push/${socketId}/register`)
        .send({ endpoint, key, authSecret })
        .end((err) => {
          if (err) {
            console.error(err);
            return;
          }

          trackEvent('Service Worker', 'Push register', 'registered');
          console.log('registered push notifications');
        });
    });
}

export function unsubscribeFromNotifications() {
  return getSubscription()
    .then((subscription) => {
      if (!subscription) {
        return false;
      }

      return subscription.unsubscribe();
    })
    .then(() => {
      console.log('unsubscribed');
    })
    .catch((err) => {
      console.error({ err });
    });
}

export function initPushNotifications() {
  if (!window.Notification) {
    trackEvent('Service Worker', 'Push permissions', 'unsupported');
    return false;
  }

  const { user } = UserStore.getState();
  if ((user.user_id && user.settings.pushNotificationsEnabled) || !user.user_id) {
    if (Notification.permission === 'granted') {
      trackEvent('Service Worker', 'Push permissions', 'granted');
      registerPushNotifications();
    } else if (Notification.permission === 'denied') {
      trackEvent('Service Worker', 'Push permissions', 'denied');
      if (user.user_id) {
        setNotificationsEnabled(user.user_id, false);
      }
      setNotificationsEnabledAction(false);
    } else {
      trackEvent('Service Worker', 'Push permissions', 'requested');
      Notification.requestPermission((status) => {
        trackEvent('Service Worker', 'Push permissions', status);
        if (status === 'granted') {
          registerPushNotifications();
        }
      });
    }
  }
}

export function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          registration.onupdatefound = function onupdatefound() {
            // The updatefound event implies that reg.installing is set; see
            // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
            const installingWorker = registration.installing;

            installingWorker.onstatechange = function onstatechange() {
              switch (installingWorker.state) {
                case 'installed':
                  if (navigator.serviceWorker.controller) {
                    // At this point, the old content will have been purged and the fresh content will
                    // have been added to the cache.
                    // It's the perfect time to display a "New content is available; please refresh."
                    // message in the page's interface.
                    console.log('New or updated content is available.');
                    addNotification({
                      color: 'blue',
                      message: 'Site has been updated.',
                    });
                  } else {
                    // At this point, everything has been precached.
                    // It's the perfect time to display a
                    // "Content is cached for offline use." message.
                    console.log('Content is now available offline!');
                  }
                  break;

                case 'redundant':
                  console.error('The installing service worker became redundant.');
                  break;
                default:
                  break;
              }
            };
          };

          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((err) => {
          trackEvent('Service Worker', 'Register', 'failed');
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
}
