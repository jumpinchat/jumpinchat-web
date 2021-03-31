/* global document */

import { EventEmitter } from 'events';
import debounce from 'lodash/debounce';
import moment from 'moment';
import uuid from 'uuid';
import { ChatDispatcher } from '../../dispatcher/AppDispatcher';
import * as types from '../../constants/ActionTypes';
import { chatTabs } from '../../constants/RoomConstants';
import { get, set } from '../../utils/localStorage';
import { getUserMentioned, getRoleMentioned } from '../../utils/chatUtils';

const storageKey = 'settingsChat';
const messageHistoryKey = 'messages';
const messageHistoryTimestampKey = 'messageTime';

function saveMessages(room, messages) {
  set(
    `${messageHistoryKey}:${room}`,
    messages
      .filter(m => !m.status && !m.history)
      .map(m => ({ ...m, color: null })),
  );
  set(`${messageHistoryTimestampKey}:${room}`, new Date().toISOString());
}

function handleRetrieveMessages(room) {
  const messages = get(`${messageHistoryKey}:${room}`);
  const messagesTimestamp = get(`${messageHistoryTimestampKey}:${room}`);
  if (messages && messages.length > 0) {
    const timestampString = moment(messagesTimestamp).calendar();
    const timestampMessage = [
      {
        id: uuid.v4(),
        message: `Messages restored from ${timestampString}`,
        status: true,
        timestamp: new Date().toISOString(),
      },
      {
        id: uuid.v4(),
        message: ' ',
        status: true,
        timestamp: new Date().toISOString(),
      },
    ];

    return [
      ...messages.map(m => ({ ...m, history: true })),
      ...timestampMessage,
    ];
  }
}

const debouncedSaveMessages = debounce(saveMessages, 250, { maxWait: 1000 });

export class ChatStore extends EventEmitter {
  constructor() {
    super();
    const state = get(storageKey);
    this.room = '';
    this.state = {
      messages: [],
      sentMessages: [],
      sounds: true,
      userListOptionsOpen: null,
      users: [],
      banlist: [],
      moderators: [],
      chatInputValue: '',
      windowIsVisible: true,
      unreadMessages: 0,
      clientUser: null,
      donePlayingNotification: true,
      showUserList: false,
      settingsOptionsOpen: false,
      chatTab: chatTabs.CHAT_FEED,
      emojiPickerOpen: false,
      emoji: [],
      ignoreList: [],
      scroll: {
        fixScroll: false,
      },
      emojiSearch: {
        results: [],
        query: null,
        selected: 0,
      },
      chatColors: [
        'red',
        'green',
        'yellow',
        'blue',
        'purple',
        'aqua',
        'orange',
        'redalt',
        'greenalt',
        'yellowalt',
        'bluealt',
        'purplealt',
        'aquaalt',
        'orangealt',
      ],
      ...state,
    };

    this.handleCache = {};
  }

  getState() {
    return this.state;
  }

  getHandleByUserId(id) {
    const user = this.state.users.find(u => u._id === id);

    if (user) {
      return user.handle;
    }

    return this.handleCache[id];
  }

  getIgnoreItemByUserId(userListId) {
    return this.state.ignoreList.find(i => i.userListId === userListId);
  }

  setHistoricalMessages(room) {
    this.room = room;
    const messages = handleRetrieveMessages(room) || [];
    this.state = {
      ...this.state,
      messages,
    };
  }

  setClientUser(clientUser) {
    this.state = {
      ...this.state,
      clientUser,
    };

    this.state.users.forEach((u) => {
      this.handleCache[u._id] = u.handle;
    });
  }

  setUsers(users) {
    this.state = {
      ...this.state,
      users,
    };
  }

  addMessage(message) {
    const userIsIgnored = this.state.ignoreList
      .some(({ userListId }) => userListId === message.userId);

    const messageIsAdmin = this.state.users
      .some(({ _id: userListId, isAdmin }) => message.userId === userListId && isAdmin);
    const messageIsSiteMod = this.state.users
      .some(({ _id: userListId, isSiteMod }) => message.userId === userListId && isSiteMod);

    if (userIsIgnored) {
      return Promise.resolve();
    }

    if ((!this.state.windowIsVisible || this.state.chatTab !== chatTabs.CHAT_FEED)
      && !message.status) {
      this.state = {
        ...this.state,
        unreadMessages: this.state.unreadMessages += 1,
      };
    }

    if (this.state.messages.length >= 100) {
      this.state = {
        ...this.state,
        messages: this.state.messages.slice(1),
      };
    }

    this.state = {
      ...this.state,
      messages: [
        ...this.state.messages,
        {
          ...message,
          isAdmin: messageIsAdmin,
          isSiteMod: messageIsSiteMod,
        },
      ],
    };

    debouncedSaveMessages(this.room, this.state.messages);

    if (this.state.sounds
      && !message.status
      && message.userId !== this.state.clientUser._id
      && this.state.donePlayingNotification) {
      this.state = {
        ...this.state,
        donePlayingNotification: false,
      };

      let audioId = 'notification-sound';

      const { handle, username, roles } = this.state.clientUser;
      const userMentioned = getUserMentioned(message.message, handle, username);
      const roleMentioned = roles.some(role => getRoleMentioned(message.message, role));

      if (userMentioned || roleMentioned) {
        audioId = 'mention-sound';
      }

      return document.getElementById(audioId).play()
        .then(() => {
          this.state.donePlayingNotification = true;
        })
        .catch(() => {
          this.state.donePlayingNotification = true;
        });
    }
  }

  clearMessages() {
    this.state = {
      ...this.state,
      messages: [],
    };
  }

  saveClientMessage(message) {
    if (this.state.sentMessages.length >= 5) {
      this.state = {
        ...this.state,
        sentMessages: this.state.sentMessages.slice(0, -1),
      };
    }

    this.state = {
      ...this.state,
      sentMessages: [message, ...this.state.sentMessages],
    };
  }


  selectPrevMessage(prev) {
    const currentMessageIndex = this.state.sentMessages
      .indexOf(this.state.chatInputValue);

    if (currentMessageIndex === -1 && !prev) {
      return;
    }

    const step = prev ? 1 : -1;

    this.state = {
      ...this.state,
      chatInputValue: this.state.sentMessages[currentMessageIndex + step],
    };
  }

  addUser(user) {
    this.state = {
      ...this.state,
      users: [...this.state.users, user],
    };

    this.handleCache[user._id] = user.handle;
  }

  removeUser(userToRemove) {
    this.state = {
      ...this.state,
      users: this.state.users.filter(u => u._id !== userToRemove._id),
    };
  }

  updateUser(user) {
    this.state = {
      ...this.state,
      users: this.state.users.map((u) => {
        if (u._id === user._id) {
          return user;
        }

        return u;
      }),
    };
  }

  updateUserList(user) {
    const userInList = this.state.users.filter(u => u._id === user._id);

    // user exists in userlist, update user
    // with new info
    // Otherwise, add them to the userlist
    if (userInList.length) {
      this.updateUser(user);
    } else {
      this.addUser(user);
    }
  }

  updateModList(moderators) {
    this.state = {
      ...this.state,
      moderators,
    };
  }

  changeUserHandle(modifiedUser) {
    this.state = {
      ...this.state,
      users: this.state.users.map((user) => {
        if (user._id === modifiedUser.userId) {
          return { ...user, handle: modifiedUser.handle };
        }

        return user;
      }),
    };

    this.handleCache[modifiedUser.userId] = modifiedUser.handle;

    if (this.state.clientUser && modifiedUser.userId === this.state.clientUser._id) {
      this.setClientUser({
        ...this.state.clientUser,
        handle: modifiedUser.handle,
      });
    }
  }

  setChatInputValue(chatInputValue) {
    this.state = {
      ...this.state,
      chatInputValue,
    };
  }

  setShowUserList(showUserList) {
    this.state = {
      ...this.state,
      showUserList,
    };
  }

  setWindowIsVisible(windowIsVisible) {
    const feedVisible = this.state.chatTab === chatTabs.CHAT_FEED;

    let { unreadMessages } = this.state;

    if (windowIsVisible && feedVisible) {
      unreadMessages = 0;
    }

    this.state = {
      ...this.state,
      windowIsVisible,
      unreadMessages,
    };
  }

  setUserListOption(userId) {
    this.state = {
      ...this.state,
      userListOptionOpen: userId,
    };
  }

  setMessageSounds(sounds) {
    const state = {
      ...get(storageKey),
      sounds,
    };

    this.state = {
      ...this.state,
      sounds,
    };

    set(storageKey, state);
  }

  setSettingsMenu(open) {
    this.state = {
      ...this.state,
      settingsOptionsOpen: open,
    };
  }

  selectChatTab(chatTab) {
    this.state = {
      ...this.state,
      scroll: {
        fixScroll: false,
      },
      chatTab,
    };
  }

  sendPmNotification(message) {
    if (this.state.sounds
      && !message.status
      && !message.clientIsSender
      && this.state.donePlayingNotification) {
      this.state = {
        ...this.state,
        donePlayingNotification: false,
      };

      const audioId = 'mention-sound';

      return document.getElementById(audioId).play()
        .then(() => {
          this.state.donePlayingNotification = true;
        })
        .catch(() => {
          this.state.donePlayingNotification = true;
        });
    }

    return Promise.resolve();
  }

  setEmojiPicker(open) {
    this.state = {
      ...this.state,
      emojiPickerOpen: open,
    };
  }

  insertEmoji(emojiCode) {
    this.state = {
      ...this.state,
      chatInputValue: this.state.chatInputValue.concat(emojiCode),
    };
  }

  updateIgnoreList(ignoreList) {
    this.state = {
      ...this.state,
      ignoreList,
    };
  }

  setScroll(topPosition) {
    const fixScroll = topPosition >= 50;

    this.state = {
      ...this.state,
      scroll: {
        fixScroll,
      },
    };
  }

  setScrollFixed(fixScroll) {
    this.state = {
      ...this.state,
      scroll: {
        fixScroll,
      },
    };
  }

  setEmojiSearch(results, query) {
    this.state = {
      ...this.state,
      emojiSearch: {
        ...this.state.emojiSearch,
        results,
        query,
      },
    };
  }

  setSelectedEmojiResult(selected) {
    this.state = {
      ...this.state,
      emojiSearch: {
        ...this.state.emojiSearch,
        selected,
      },
    };
  }

  setCustomEmoji(emoji) {
    const customEmoji = emoji.map(({ alias, image }) => ({
      id: alias,
      colons: `:${alias}:`,
      name: alias,
      short_names: [alias],
      text: '',
      emoticons: [],
      keywords: [alias],
      imageUrl: `https://s3.amazonaws.com/jic-uploads/${image}`,
      custom: true,
    }));

    this.state = {
      ...this.state,
      emoji: customEmoji,
    };
  }

  setBanlist(banlist) {
    this.state = {
      ...this.state,
      banlist,
    };
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


const chatStore = new ChatStore();

chatStore.dispatchToken = ChatDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case types.CHAT_SET_USERS:
      chatStore.setUsers(action.users);
      break;

    case types.SET_CLIENT_USER:
      chatStore.setClientUser(action.user);
      break;

    case types.MESSAGE_ADD:
      chatStore.addMessage(action.data);
      break;

    case types.USER_CONNECT:
      chatStore.addUser(action.user);
      chatStore.updateModList(action.opList);
      break;

    case types.USER_DISCONNECT:
      chatStore.removeUser(action.data);
      break;

    case types.USER_UPDATE_HANDLE:
      chatStore.changeUserHandle(action.data);
      break;

    case types.USER_UPDATE:
      chatStore.updateUser(action.data);
      break;

    case types.USER_UPDATE_USERLIST:
      chatStore.updateUserList(action.user);
      break;

    case types.SET_USER_LIST_OPTION_LIST:
      chatStore.setUserListOption(action.data);
      break;

    case types.SET_CHAT_INPUT_VALUE:
      chatStore.setChatInputValue(action.value);
      break;

    case types.SET_WINDOW_IS_VISIBLE:
      chatStore.setWindowIsVisible(action.visible);
      break;

    case types.SET_SHOW_USERLIST:
      chatStore.setShowUserList(action.show);
      break;

    case types.SET_MESSAGE_SOUND:
      chatStore.setMessageSounds(action.sound);
      break;

    case types.CHAT_SET_SETTINGS:
      chatStore.setSettingsMenu(action.open);
      break;

    case types.MESSAGE_SEND:
      chatStore.saveClientMessage(action.message);
      break;

    case types.RESTORE_MESSAGE:
      chatStore.selectPrevMessage(action.prev);
      break;

    case types.SELECT_CHAT_TAB:
      chatStore.selectChatTab(action.tab);
      break;

    case types.ADD_PRIVATE_MESSAGE:
      chatStore.sendPmNotification(action.msg);
      break;

    case types.CHAT_CLEAR_FEED:
      chatStore.clearMessages();
      break;

    case types.SET_EMOJI_PICKER:
      chatStore.setEmojiPicker(action.open);
      break;
    case types.INSERT_EMOJI:
      chatStore.insertEmoji(action.emojiCode);
      break;

    case types.UPDATE_IGNORE:
      chatStore.updateIgnoreList(action.ignoreList);
      break;

    case types.CHAT_SET_SCROLL:
      chatStore.setScroll(action.topPosition);
      break;

    case types.CHAT_SET_SCROLL_FIXED:
      chatStore.setScrollFixed(action.fixScroll);
      break;

    case types.SET_EMOJI_SEARCH:
      chatStore.setEmojiSearch(action.results, action.query);
      break;

    case types.SET_EMOJI_RESULT_SELECTED:
      chatStore.setSelectedEmojiResult(action.selected);
      break;

    case types.ROOM_EMOJI:
      chatStore.setCustomEmoji(action.emoji);
      break;

    case types.SET_MESSAGE_HISTORY:
      chatStore.setHistoricalMessages(action.room);
      break;

    case types.SET_BANLIST:
      chatStore.setBanlist(action.list);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  chatStore.emitChange();

  return true;
});

export default chatStore;
