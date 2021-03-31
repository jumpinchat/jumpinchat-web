/**
 * Created by vivaldi on 14/04/2015.
 */

import { EventEmitter } from 'events';
import uuid from 'uuid';
import { NotificationDispatcher } from '../dispatcher/AppDispatcher';
import {
  ADD_NOTIFICATION,
  CLOSE_NOTIFICATION,
  PAUSE_NOTIFICATIONS,
  RESUME_NOTIFICATION,
} from '../constants/ActionTypes';

export class NotificationStore extends EventEmitter {
  constructor() {
    super();
    this.notifications = [];
    this.timer = null;
  }

  getNotifications() {
    return this.notifications;
  }

  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }

  /**
   * check the array to see if any of the notifications are
   * autoClose. If not, the array should be considered the
   * same as it were empty, to enable timers to be nullified.
   *
   * This is used for handling one or more manual close notifications
   * so that the timer will not perpetually attempt to pop the notification
   */
  checkArrayForTempNotifications() {
    return !!this.notifications.filter(n => n.autoClose === true).length;
  }

  /**
   * check if there are any notifications in the array,
   * if it's empty, clear the interval timer
   */
  shouldClearTimer() {
    if (this.notifications.length === 0) {
      clearInterval(this.timer);

      // force the timer to be null once
      // the array is empty to avoid
      // multiple timers being created
      this.timer = null;
      return;
    }

    if (this.checkArrayForTempNotifications() === false) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }


  popNotification() {
    const notification = this.notifications.pop();

    if (!notification) {
      return;
    }

    // if the notification should be manually closed,
    // push it back up to the beginning of the array
    if (!notification.autoClose) {
      this.notifications = [notification, ...this.notifications];
    }
  }

  notificationsTimerCallback() {
    // pop off the last notification (oldest)
    this.popNotification();

    // emit change to update component with updated
    // notification array
    this.emitChange();

    this.shouldClearTimer();
  }

  /**
   * start an interval timer to pop a notification out of
   * the array at a set interval. After each pop, check the
   * array length and clear the timer if it's empty.
   */
  notificationsTimer() {
    const notificationTime = 3000;

    if (this.notifications.length) {
      this.timer = setInterval(
        this.notificationsTimerCallback.bind(this),
        notificationTime,
        notificationTime,
      );
    }
  }

  addNotification(notification) {
    let firstAutoClose = 0;
    this.notifications
      .forEach((n, i) => {
        if (n.autoClose && firstAutoClose === 0) {
          firstAutoClose = i;
        }
      });

    const existingNotification = this.notifications.some(n => n.message === notification.message);

    if (existingNotification) {
      return false;
    }

    if (this.notifications.length >= 5) {
      if (firstAutoClose > 0) {
        this.notifications = [
          ...this.notifications.slice(0, firstAutoClose),
          ...this.notifications.slice(firstAutoClose + 1),
        ];
      } else {
        this.notifications = this.notifications.slice(firstAutoClose + 1);
      }
    }

    this.notifications = [{ ...notification, id: uuid.v4() }, ...this.notifications];

    // only re-initialize the timer if it's not
    // already initialized.
    if (!this.timer) {
      this.notificationsTimer();
    }
  }


  // splice out a notification if it's manually closed.
  // should not affect the timeouts
  closeNotification(index) {
    if (this.notifications.length) {
      this.notifications.splice(index, 1);
    }
  }

  // pause the notification timer, if the user hovers over the
  // notification timer.
  pauseNotificationTimer() {
    clearInterval(this.timer);
  }
}

const notificationStore = new NotificationStore();

NotificationDispatcher.register((payload) => {
  const { action } = payload;
  switch (action.actionType) {
    case ADD_NOTIFICATION:
      notificationStore.addNotification(action.data);
      break;

    case CLOSE_NOTIFICATION:
      notificationStore.closeNotification(action.data);
      break;

    case PAUSE_NOTIFICATIONS:
      notificationStore.pauseNotificationTimer();
      break;

    case RESUME_NOTIFICATION:
      notificationStore.notificationsTimer();
      break;

    default:
      return true;
  }

  notificationStore.emitChange();

  return true;
});

export default notificationStore;
