import {
  ChatDispatcher,
  CamDispatcher,
} from '../dispatcher/AppDispatcher';
import { trackEvent } from '../utils/AnalyticsUtil';
import * as types from '../constants/ActionTypes';

export function setUserList(users) {
  ChatDispatcher.handleAction({
    actionType: types.CHAT_SET_USERS,
    users,
  });
}

export function setClientUser(user) {
  ChatDispatcher.handleAction({
    actionType: types.SET_CLIENT_USER,
    user,
  });
}

export function addMessage(message) {
  ChatDispatcher.handleAction({
    actionType: types.MESSAGE_ADD,
    data: message,
  });
}

export function sendChatMessage(message) {
  trackEvent('Chat', 'Send message');
  ChatDispatcher.handleAction({
    actionType: types.MESSAGE_SEND,
    message,
  });

  CamDispatcher.handleAction({
    actionType: types.MESSAGE_SEND,
  });
}

export function addUser(user, opList) {
  ChatDispatcher.handleAction({
    actionType: types.USER_CONNECT,
    user,
    opList,
  });
}

export function updateUserList(user) {
  ChatDispatcher.handleAction({
    actionType: types.USER_UPDATE_USERLIST,
    user,
  });
}

export function removeUser(user) {
  ChatDispatcher.handleAction({
    actionType: types.USER_DISCONNECT,
    data: user,
  });
}

export function updateUserHandle(user) {
  ChatDispatcher.handleAction({
    actionType: types.USER_UPDATE_HANDLE,
    data: user,
  });
}

export function updateUser(user) {
  ChatDispatcher.handleAction({
    actionType: types.USER_UPDATE,
    data: user,
  });
}

export function setUserListOption(userId) {
  ChatDispatcher.handleAction({
    actionType: types.SET_USER_LIST_OPTION_LIST,
    data: userId,
  });
}

export function setUserlist(show) {
  trackEvent('UserList', 'Set userlist on mobile', show);

  ChatDispatcher.handleAction({
    actionType: types.SET_SHOW_USERLIST,
    show,
  });
}

export function setChatInputValue(value) {
  ChatDispatcher.handleAction({
    actionType: types.SET_CHAT_INPUT_VALUE,
    value,
  });
}

export function setWindowIsVisible(visible) {
  ChatDispatcher.handleAction({
    actionType: types.SET_WINDOW_IS_VISIBLE,
    visible,
  });
}


export function setRoomMessageSounds(sound) {
  trackEvent('Cams', 'Set message notification sound', sound);
  ChatDispatcher.handleAction({
    actionType: types.SET_MESSAGE_SOUND,
    sound,
  });
}


export function setSettingsMenu(open) {
  trackEvent('Chat', `${open ? 'open' : 'close'} settings menu`);
  ChatDispatcher.handleAction({
    actionType: types.CHAT_SET_SETTINGS,
    open,
  });
}

export function restoreMessage(prev = true) {
  ChatDispatcher.handleAction({
    actionType: types.RESTORE_MESSAGE,
    prev,
  });
}

export function selectChatTab(tab) {
  ChatDispatcher.handleAction({
    actionType: types.SELECT_CHAT_TAB,
    tab,
  });
}

export function clearMessages() {
  ChatDispatcher.handleAction({
    actionType: types.CHAT_CLEAR_FEED,
  });
}

export function setEmojiPicker(open) {
  trackEvent('Chat', 'Set emoji picker', open ? 'open' : 'close');
  ChatDispatcher.handleAction({
    actionType: types.SET_EMOJI_PICKER,
    open,
  });
}

export function insertEmoji(emojiCode) {
  trackEvent('Chat', 'Insert emoji');
  ChatDispatcher.handleAction({
    actionType: types.INSERT_EMOJI,
    emojiCode,
  });
}

export function updateIgnoreList(ignoreList) {
  ChatDispatcher.handleAction({
    actionType: types.UPDATE_IGNORE,
    ignoreList,
  });
}

export function setScroll(topPosition) {
  ChatDispatcher.handleAction({
    actionType: types.CHAT_SET_SCROLL,
    topPosition,
  });
}

export function setScrollFixed(fixScroll) {
  ChatDispatcher.handleAction({
    actionType: types.CHAT_SET_SCROLL_FIXED,
    fixScroll,
  });
}

export function setEmojiSearch(results, query) {
  ChatDispatcher.handleAction({
    actionType: types.SET_EMOJI_SEARCH,
    results,
    query,
  });
}

export function setSelectedEmojiResult(selected) {
  ChatDispatcher.handleAction({
    actionType: types.SET_EMOJI_RESULT_SELECTED,
    selected,
  });
}

export function setRoomEmoji(emoji) {
  ChatDispatcher.handleAction({
    actionType: types.ROOM_EMOJI,
    emoji,
  });
}

export function setHistoricalMessages(room) {
  ChatDispatcher.handleAction({
    actionType: types.SET_MESSAGE_HISTORY,
    room,
  });
}

export function setBanlist(list) {
  ChatDispatcher.handleAction({
    actionType: types.SET_BANLIST,
    list,
  });
}
