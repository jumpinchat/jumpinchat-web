/* global URL, self, clients */

const notificationTimeout = 5000;
const maxNotifications = 3;
let currentNotificationTag = 0;

function getNextNotificationTag() {
  const next = currentNotificationTag + 1;
  if (next > maxNotifications) {
    currentNotificationTag = 1;
  } else {
    currentNotificationTag += 1;
  }

  return currentNotificationTag;
}

self.addEventListener('push', (event) => {
  let payload;

  try {
    payload = event.data.json();
  } catch (e) {
    console.error({ error: e, payload: event.data.text() });
    return false;
  }

  const promiseChain = clients.matchAll()
    .then((clients) => {
      const roomClients = clients
        .filter(client => new URL(client.url).pathname.replace(/\//g, '') === payload.room);

      const clientIsHomescreenApp = roomClients.find((client) => {
        const clientUrl = new URL(client.url);
        if (!clientUrl.search) {
          return false;
        }

        const urlParams = clientUrl.search.replace(/^\?/, '').split('&').map(p => p.split('='));
        return urlParams.find(([key, value]) => key === 'utm_medium' && value === 'homescreen');
      });

      const focusedClient = roomClients.find(client => client.visibilityState === 'visible');

      if (focusedClient && focusedClient.focused) {
        return false;
      }

      let title;
      const { id } = payload;

      if (payload.context === 'pm') {
        title = `${payload.handle} - ${payload.room}`;
      } else {
        title = payload.room;
      }

      const tag = clientIsHomescreenApp ? title : `${title}${getNextNotificationTag()}`;

      return self.registration.getNotifications()
        .then((notifications) => {
          notifications.forEach((notification) => {
            if (notification.tag === tag) {
              notification.close();
            }
          });
          return notifications;
        })
        .then(notifications => notifications.find(n => n.tag === tag))
        .then((currentNotification) => {
          const body = currentNotification && clientIsHomescreenApp
            ? `${currentNotification.data.messages} unread messages`
            : `${payload.handle}: ${payload.message}`;


          return self.registration.showNotification(title, {
            body,
            badge: '/img/logo.png',
            tag,
            renotify: payload.renotify,
            requireInteraction: false,
            icon: '/img/jic-logo-192x192.png',
            data: {
              url: new URL(payload.room, self.location.origin).href,
              messages: currentNotification ? currentNotification.data.messages + 1 : 1,
              id,
            },
          });
        })
        .then(() => self.registration.getNotifications())
        .then((notifications) => {
          if (clientIsHomescreenApp) {
            return false;
          }

          const lastNotification = notifications.find(n => n.data.id === id);
          if (lastNotification) {
            return setTimeout(() => lastNotification.close(), notificationTimeout);
          }

          return null;
        });
    })
    .catch((err) => {
      console.error(err);
    });

  event.waitUntil(promiseChain);
});


self.addEventListener('notificationclick', (event) => {
  const { notification } = event;

  notification.close();
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  })
    .then((windowClients) => {
      const windowClient = windowClients
        .find((client) => {
          const { origin, pathname } = new URL(client.url);
          const normalizedUrl = `${origin}/${pathname.replace(/\//g, '')}`;
          return normalizedUrl === notification.data.url;
        });

      if (windowClient) {
        return windowClient.focus();
      }

      return clients.openWindow(notification.data.url);
    });

  event.waitUntil(promiseChain);
});
