/* global window, document, describe, it, beforeEach */

import { NotificationStore } from './NotificationStore';

describe('NotificationStore', () => {
  let notificationStore;
  beforeEach(() => {
    notificationStore = new NotificationStore();
    window.clearInterval = jest.fn();
  });

  describe('checkArrayForTempNotifications', () => {
    it('should return true if there are auto close notifications', () => {
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
        { autoClose: false, message: '2' },
      ];
      const notifications = notificationStore.checkArrayForTempNotifications();

      expect(notifications).toEqual(true);
    });

    it('should return false if there are no auto close notifications', () => {
      notificationStore.notifications = [
        { autoClose: false, message: '2' },
      ];
      const notifications = notificationStore.checkArrayForTempNotifications();

      expect(notifications).toEqual(false);
    });
  });

  describe('shouldClearTimer', () => {
    beforeEach(() => {
      notificationStore.timer = 'foo';
    });

    it('should clear timeout if there are no notifications', () => {
      notificationStore.notifications = [];
      notificationStore.shouldClearTimer();
      expect(window.clearInterval.mock.calls[0][0]).toEqual('foo');
    });

    it('should clear timeout if there are no temp notifications', () => {
      notificationStore.timer = 'foo';
      notificationStore.notifications = [
        { autoClose: false, message: '2' },
      ];

      notificationStore.checkArrayForTempNotifications = jest.fn(() => false);
      notificationStore.shouldClearTimer();

      expect(window.clearInterval).toHaveBeenCalledWith('foo');
    });

    it('should not clear time out if there are valid notifications', () => {
      notificationStore.timer = 'foo';
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
        { autoClose: false, message: '2' },
      ];

      notificationStore.checkArrayForTempNotifications = jest.fn(() => true);
      notificationStore.shouldClearTimer();

      expect(window.clearInterval).not.toHaveBeenCalled();
    });
  });

  describe('popNotification', () => {
    it('should put manually closing notifications to beginning of array', () => {
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
        { autoClose: false, message: '2' },
      ];

      notificationStore.popNotification();
      expect(notificationStore.notifications).toEqual([
        { autoClose: false, message: '2' },
        { autoClose: true, message: '1' },
      ]);
    });

    it('should remove notification if it is autoclosing', () => {
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
      ];

      notificationStore.popNotification();
      expect(notificationStore.notifications.length).toEqual(0);
    });
  });

  describe('notificationsTimerCallback', () => {
    beforeEach(() => {
      notificationStore.popNotification = jest.fn();
      notificationStore.emitChange = jest.fn();
      notificationStore.shouldClearTimer = jest.fn();
    });

    it('should call popNotification', () => {
      notificationStore.notificationsTimerCallback();
      expect(notificationStore.popNotification).toHaveBeenCalled();
    });

    it('should call emitChange', () => {
      notificationStore.notificationsTimerCallback();
      expect(notificationStore.emitChange).toHaveBeenCalled();
    });

    it('should call shouldClearTimer', () => {
      notificationStore.notificationsTimerCallback();
      expect(notificationStore.shouldClearTimer).toHaveBeenCalled();
    });
  });

  describe('notificationsTimer', () => {
    it('should set a timer if there are notifications', () => {
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
      ];
      window.setInterval = jest.fn(() => 'foo');
      notificationStore.notificationsTimer();
      expect(notificationStore.timer).toEqual('foo');
    });

    it('should set a timer with timeout', () => {
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
      ];
      window.setInterval = jest.fn();
      notificationStore.notificationsTimer();
      expect(window.setInterval.mock.calls[0][1]).toEqual(3000);
      expect(window.setInterval.mock.calls[0][2]).toEqual(3000);
    });

    it('should not set a timer when there are no notifications', () => {
      notificationStore.notifications = [];
      window.setInterval = jest.fn();
      notificationStore.notificationsTimer();
      expect(window.setInterval).not.toHaveBeenCalled();
    });
  });

  describe('addNotification', () => {
    beforeEach(() => {
      notificationStore.notifications = [];
      notificationStore.notificationsTimer = jest.fn();
    });

    it('should add a notification', () => {
      notificationStore.addNotification({ message: 'foo' });
      expect(notificationStore.notifications.length).toEqual(1);
      expect(notificationStore.notifications[0].message).toEqual('foo');
    });

    it('should set timer if no timer is set', () => {
      notificationStore.addNotification({ message: 'foo' });
      expect(notificationStore.notificationsTimer).toHaveBeenCalled();
    });

    it('should not set timer if timer is set', () => {
      notificationStore.timer = 'foo';
      notificationStore.addNotification({ message: 'foo' });
      expect(notificationStore.notificationsTimer).not.toHaveBeenCalled();
    });

    it('should remove last notification if there are 5', () => {
      notificationStore.notifications = [
        { autoClose: true },
        { autoClose: true },
        { autoClose: true },
        { autoClose: true },
        { autoClose: true },
      ];

      notificationStore.addNotification({ message: 'foo' });
      expect(notificationStore.notifications.length).toEqual(5);
    });

    it('should not remove notification if it is manual close', () => {
      notificationStore.notifications = [
        { autoClose: true, message: 'butts' },
        { autoClose: true },
        { autoClose: true },
        { autoClose: true },
        { autoClose: false, message: 'dont kill me' },
      ];

      notificationStore.addNotification({ message: 'foo' });
      expect(notificationStore.notifications.length).toEqual(5);
      expect(notificationStore.notifications[4].message).toEqual('dont kill me');
      expect(notificationStore.notifications[0].message).toEqual('foo');
    });

    it('should not add notification if one already exists', () => {
      notificationStore.notifications = [
        { autoClose: true, message: 'foo' },
      ];

      notificationStore.addNotification({ message: 'foo' });
      expect(notificationStore.notifications).toEqual([
        { autoClose: true, message: 'foo' },
      ]);
    });
  });

  describe('closeNotification', () => {
    it('should remove notification at index', () => {
      notificationStore.notifications = [
        { autoClose: true, message: '1' },
        { autoClose: false, message: '2' },
        { autoClose: true, message: '3' },
      ];

      notificationStore.closeNotification(1);
      expect(notificationStore.notifications).toEqual([
        { autoClose: true, message: '1' },
        { autoClose: true, message: '3' },
      ]);
    });
  });

  describe('pauseNotificationTimer', () => {
    it('should clear interval', () => {
      notificationStore.timer = 'foo';
      notificationStore.pauseNotificationTimer();
      expect(window.clearInterval).toHaveBeenCalledWith('foo');
    });
  });
});
