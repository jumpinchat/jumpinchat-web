import { EventEmitter } from 'events';
import uuid from 'uuid';
import { PmDispatcher } from '../../dispatcher/AppDispatcher';
import * as types from '../../constants/ActionTypes';
import {
  PM_START_MESSAGE,
  chatTabs,
} from '../../constants/RoomConstants';
import chatStore from '../ChatStore/ChatStore';
import userStore from '../UserStore';


export class PmStore extends EventEmitter {
  static getUnreadConversations(privateMessages) {
    return privateMessages.reduce((acc, { unreadMessages }) => {
      let val = acc;
      if (unreadMessages > 0) {
        val += 1;
      }

      return val;
    }, 0);
  }

  constructor() {
    super();
    this.state = {
      tabOpen: false,
      windowInFocus: true,
      menuOpen: null,
      privateMessages: [],
      selectedConversation: null,
      donePlayingNotification: true,
      unreadConversations: 0,
    };
  }

  getState() {
    return this.state;
  }

  sendNotification(message) {
    const { sounds } = chatStore.getState();
    const { donePlayingNotification } = this.state;
    if (sounds && !message.status && !message.clientIsSender && donePlayingNotification) {
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


  getConversation(recipientListId) {
    const { privateMessages } = this.state;

    const conversation = privateMessages.find(c => c.user.userListId === recipientListId);
    if (conversation) {
      return conversation.messages;
    }

    return [];
  }

  setWindowIsVisible(windowInFocus) {
    this.state = {
      ...this.state,
      windowInFocus,
    };
  }

  setMessagesRead(userListId) {
    const { privateMessages } = this.state;
    const updatedPrivateMessages = privateMessages.map((convo) => {
      const { user } = convo;
      if (user.userListId === userListId) {
        return {
          ...convo,
          unreadMessages: 0,
        };
      }

      return convo;
    });

    this.state = {
      ...this.state,
      privateMessages: updatedPrivateMessages,
      unreadConversations: PmStore.getUnreadConversations(updatedPrivateMessages),
    };
  }

  setUnreadMessages(userListId, clientIsSender) {
    const conversation = this.state.privateMessages
      .find(c => c.user.userListId === userListId);


    const pmsNotVisable = (!this.state.windowInFocus || !this.state.tabOpen);

    if (this.state.selectedConversation !== userListId || pmsNotVisable) {
      if (clientIsSender) {
        return conversation.unreadMessages;
      }

      if (conversation && conversation.unreadMessages) {
        return conversation.unreadMessages + 1;
      }

      return 1;
    }

    return 0;
  }


  addPrivateMessage(msg) {
    const {
      userListId,
      userId,
    } = msg;

    const {
      user: {
        _id: clientUserListId,
      },
    } = userStore.getState();

    const { ignoreList } = chatStore.getState();
    const userIsIgnored = ignoreList
      .some(({ userListId: ignoredListId }) => ignoredListId === userListId);

    if (userIsIgnored) {
      return;
    }

    let privateMessages;
    const conversationExists = this.state.privateMessages
      .find(m => m.user.userListId === userListId || (userId && m.user.userId === userId));

    if (conversationExists) {
      privateMessages = this.state.privateMessages.map((conversation) => {
        if (conversation.user.userListId === userListId) {
          return {
            ...conversation,
            messages: [
              ...conversation.messages,
              {
                ...msg,
              },
            ],
            unreadMessages: this.setUnreadMessages(userListId, msg.clientIsSender),
          };
        }

        return conversation;
      });
    } else {
      const clientIsSender = userListId === clientUserListId;
      privateMessages = [
        {
          user: {
            userListId,
            userId,
            handle: chatStore.getHandleByUserId(userListId),
          },
          messages: [
            {
              ...msg,
              clientIsSender,
            },
          ],
          unreadMessages: this.setUnreadMessages(userListId, clientIsSender),
        },
        ...this.state.privateMessages,
      ];
    }

    this.state = {
      ...this.state,
      privateMessages,
      unreadConversations: PmStore.getUnreadConversations(privateMessages),
    };
  }

  setPmActiveConversation(userListId, userId = null) {
    let { privateMessages } = this.state;
    const { selectedConversation } = this.state;

    if (selectedConversation === userListId) {
      return;
    }

    const conversationExists = this.state.privateMessages
      .find(c => c.user.userListId === userListId || (userId && c.user.userId === userId));
    if (!conversationExists) {
      privateMessages = [
        {
          user: {
            userListId,
            userId,
            handle: chatStore.getHandleByUserId(userListId),
          },
          messages: [{
            status: true,
            id: uuid.v4(),
            message: `${PM_START_MESSAGE} ${chatStore.getHandleByUserId(userListId)}`,
          }],
        },
        ...privateMessages,
      ];
    } else {
      privateMessages = privateMessages.map((conversation) => {
        const {
          user: {
            userId: currentUserId,
          },
        } = conversation;

        if (currentUserId && currentUserId === conversationExists.user.userId
          && currentUserId !== userListId) {
          let messages = [
            ...conversationExists.messages,
          ];

          if (conversationExists.disabled) {
            messages = [
              ...messages,
              {
                id: uuid.v4(),
                message: 'Conversation resumed',
                status: true,
              },
            ];
          }
          return {
            ...conversationExists,
            user: {
              ...conversationExists.user,
              userListId,
            },
            messages,
            disabled: false,
          };
        }

        return conversation;
      });
    }

    const newPrivateMessages = privateMessages.map((conversation) => {
      if (conversation.user.userListId === userListId) {
        return {
          ...conversation,
          unreadMessages: 0,
        };
      }

      return conversation;
    });

    this.state = {
      ...this.state,
      selectedConversation: userListId,
      unreadConversations: PmStore.getUnreadConversations(newPrivateMessages),
      privateMessages: newPrivateMessages,
    };
  }

  removeConversation(userListId) {
    this.state = {
      ...this.state,
      privateMessages: this.state.privateMessages
        .filter(convo => convo.user.userListId !== userListId),
    };
  }

  disableConversation(userListId) {
    this.state = {
      ...this.state,
      privateMessages: this.state.privateMessages
        .map((convo) => {
          if (convo.user.userListId === userListId) {
            return {
              ...convo,
              messages: [
                ...convo.messages,
                {
                  id: uuid.v4(),
                  message: 'User has left, convesation has been closed.',
                  status: true,
                },
              ],
              disabled: true,
            };
          }

          return convo;
        }),
    };
  }

  openMenu(userListId) {
    this.state = {
      ...this.state,
      menuOpen: userListId,
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

const pmStore = new PmStore();

pmStore.dispatchToken = PmDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case types.ADD_PRIVATE_MESSAGE:
      pmStore.addPrivateMessage(action.msg);
      pmStore.sendNotification(action.msg);
      break;

    case types.PM_START_CONVERSATION:
      pmStore.setPmActiveConversation(action.userListId, action.userId);
      break;

    case types.PM_SELECT_CONVERSATION:
      pmStore.setPmActiveConversation(action.userListId, action.userId);
      break;

    case types.PM_REMOVE_CONVERSATION:
      pmStore.disableConversation(action.userListId);
      break;

    case types.SET_WINDOW_IS_VISIBLE:
      pmStore.setWindowIsVisible(action.visible);
      break;

    case types.PM_OPEN_MENU:
      pmStore.openMenu(action.userListId);
      break;

    case types.PM_CLOSE_CONVERSATION:
      pmStore.removeConversation(action.userListId);
      break;

    case types.PM_SET_CONVO_READ:
      pmStore.setMessagesRead(action.userListId);
      break;

    default:
      return true;
  }

  pmStore.emitChange();

  return true;
});

export default pmStore;
