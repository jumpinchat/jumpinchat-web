import { PmDispatcher } from '../dispatcher/AppDispatcher';
import { trackEvent } from '../utils/AnalyticsUtil';
import * as types from '../constants/ActionTypes';
import {
  selectChatTab,
} from './ChatActions';
import { chatTabs } from '../constants/RoomConstants';

export function addPrivateMessage(msg) {
  trackEvent('Private Message', 'Send private message');
  PmDispatcher.handleAction({
    actionType: types.ADD_PRIVATE_MESSAGE,
    msg,
  });
}

export function pmStartConversation(userListId, userId) {
  trackEvent('Private Message', 'Start private conversation');
  selectChatTab(chatTabs.CHAT_PM);
  PmDispatcher.handleAction({
    actionType: types.PM_START_CONVERSATION,
    userListId,
    userId,
  });
}

export function pmSelectConversation(userListId) {
  trackEvent('Private Message', 'Select private conversation');
  PmDispatcher.handleAction({
    actionType: types.PM_SELECT_CONVERSATION,
    userListId,
  });
}

export function removeConversation(userListId) {
  PmDispatcher.handleAction({
    actionType: types.PM_REMOVE_CONVERSATION,
    userListId,
  });
}

export function openMenu(userListId) {
  PmDispatcher.handleAction({
    actionType: types.PM_OPEN_MENU,
    userListId,
  });
}

export function closeConversation(userListId) {
  PmDispatcher.handleAction({
    actionType: types.PM_CLOSE_CONVERSATION,
    userListId,
  });
}

export function setConversationRead(userListId) {
  PmDispatcher.handleAction({
    actionType: types.PM_SET_CONVO_READ,
    userListId,
  });
}
