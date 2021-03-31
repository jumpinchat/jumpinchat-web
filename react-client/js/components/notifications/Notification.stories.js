import React from 'react';
import Notification from './Notification.react';

export default {
  title: 'components/notifications',
};

export const Notifications = () => (
  <>
    <div style={{ margin: '1em 0' }}>
      <Notification
        notification={{
          message: 'foo message',
          autoClose: true,
          color: 'red',
        }}
      />
    </div>
    <div style={{ margin: '1em 0' }}>
      <Notification
        notification={{
          message: 'foo message',
          autoClose: true,
          color: 'blue',
        }}
      />
    </div>
    <div style={{ margin: '1em 0' }}>
      <Notification
        notification={{
          message: 'foo message',
          autoClose: true,
          color: 'green',
        }}
      />
    </div>
    <div style={{ margin: '1em 0' }}>
      <Notification
        notification={{
          message: 'foo message',
          autoClose: true,
          color: 'yellow',
        }}
      />
    </div>
    <div style={{ margin: '1em 0' }}>
      <Notification
        notification={{
          message: 'Maecenas a tempor urna. Integer vehicula, neque quis consequat vestibulum, est ante pellentesque risus, nec pellentesque sapien nunc sit amet nunc.',
          autoClose: true,
          color: 'blue',
        }}
      />
    </div>
    <div style={{ margin: '1em 0' }}>
      <Notification
        notification={{
          message: 'Maecenas a tempor urna. Integer vehicula, neque quis consequat vestibulum, est ante pellentesque risus, nec pellentesque sapien nunc sit amet nunc.',
          autoClose: false,
          color: 'blue',
        }}
      />
    </div>
  </>
);

export const NotificationGroup = () => (
  <div style={{ margin: '1em 0' }}>
    <Notification
      notification={{
        message: 'foo message',
        autoClose: true,
        color: 'red',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: true,
        color: 'blue',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: true,
        color: 'green',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: true,
        color: 'yellow',
      }}
    />
  </div>
);

export const NotificationsManualClose = () => (
  <div>
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'red',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'blue',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'green',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'yellow',
      }}
    />
  </div>
);

export const containedNotifications = () => (
  <div className="notifications__Container banner__Container">
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'red',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'blue',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'green',
      }}
    />
    <Notification
      notification={{
        message: 'foo message',
        autoClose: false,
        color: 'yellow',
      }}
    />
  </div>
);
