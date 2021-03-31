/**
 * Created by vivaldi on 14/04/2015.
 */

import { NotificationDispatcher } from '../dispatcher/AppDispatcher';
import {
  ADD_NOTIFICATION,
  CLOSE_NOTIFICATION,
  PAUSE_NOTIFICATIONS,
  RESUME_NOTIFICATION,
} from '../constants/ActionTypes';

export function addNotification(notification) {
  NotificationDispatcher.handleAction({
    actionType: ADD_NOTIFICATION,
    data: notification,
  });
}

export function closeNotification(index) {
  NotificationDispatcher.handleAction({
    actionType: CLOSE_NOTIFICATION,
    data: index,
  });
}

export function pauseNotification() {
  NotificationDispatcher.handleAction({
    actionType: PAUSE_NOTIFICATIONS,
  });
}

export function resumeNotifiation() {
  NotificationDispatcher.handleAction({
    actionType: RESUME_NOTIFICATION,
  });
}
