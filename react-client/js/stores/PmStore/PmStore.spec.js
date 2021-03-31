/* global jest,expect,describe,it,beforeEach */

import { PmStore } from './PmStore';
import { chatTabs, PM_START_MESSAGE } from '../../constants/RoomConstants';

jest.mock('uuid');
jest.mock('../ChatStore/ChatStore');

describe('PmStore', () => {
  let pmStore;
  beforeEach(() => {
    pmStore = new PmStore();
  });

  describe('getConversation', () => {
    it('sould return a private conversation', () => {
      pmStore.state.privateMessages = [
        {
          user: { userListId: 'foo' },
          messages: [{ message: 'foo' }],
        },
      ];

      expect(pmStore.getConversation('foo')).toEqual([{ message: 'foo' }]);
    });
  });

  describe('setWindowIsVisiable', () => {
    it('should set windowInFocus', () => {
      pmStore.setWindowIsVisible(false);
      expect(pmStore.state.windowInFocus).toEqual(false);
    });
  });

  describe('setUnreadMessages', () => {
    it('should set unread messages to 1 if there are none', () => {
      pmStore.state = {
        windowInFocus: false,
        selectedConversation: 'bar',
        privateMessages: [
          {
            user: { userListId: 'foo' },
          },
        ],
      };

      expect(pmStore.setUnreadMessages('foo')).toEqual(1);
    });

    it('should increment unread messages', () => {
      pmStore.state = {
        windowInFocus: false,
        selectedConversation: 'bar',
        privateMessages: [
          {
            user: { userListId: 'foo' },
            unreadMessages: 1,
          },
        ],
      };

      expect(pmStore.setUnreadMessages('foo')).toEqual(2);
    });

    it('should set unread messages if tab not open', () => {
      pmStore.state = {
        windowInFocus: true,
        tabOpen: false,
        selectedConversation: 'bar',
        privateMessages: [
          {
            user: { userListId: 'foo' },
            unreadMessages: 1,
          },
        ],
      };

      expect(pmStore.setUnreadMessages('foo')).toEqual(2);
    });

    it('should set unread messages if a different conversation is selected', () => {
      pmStore.state = {
        windowInFocus: true,
        tabOpen: true,
        selectedConversation: 'bar',
        privateMessages: [
          {
            user: { userListId: 'foo' },
            unreadMessages: 1,
          },
        ],
      };

      expect(pmStore.setUnreadMessages('foo')).toEqual(2);
    });

    it('should return 0 if conversation is visible', () => {
      pmStore.state = {
        windowInFocus: true,
        tabOpen: true,
        selectedConversation: 'foo',
        privateMessages: [
          {
            user: { userListId: 'foo' },
            unreadMessages: 1,
          },
        ],
      };

      expect(pmStore.setUnreadMessages('foo')).toEqual(0);
    });
  });

  describe('addPrivateMessage', () => {
    it('should create a new conversation if none exists', () => {
      pmStore.addPrivateMessage({ userListId: 'foo', message: 'bar' });

      expect(pmStore.state.privateMessages).toEqual([
        {
          user: {
            userListId: 'foo',
            userId: undefined,
            handle: 'foo',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
              clientIsSender: false,
            },
          ],
          unreadMessages: 1,
        },
      ]);
    });

    it('should add a message to an existing conversation', () => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
            },
          ],
        },
      ];

      pmStore.addPrivateMessage({ userListId: 'foo', message: 'bar' });
      expect(pmStore.state.privateMessages).toEqual([
        {
          user: {
            userListId: 'foo',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
            },
            {
              userListId: 'foo',
              message: 'bar',
            },
          ],
          unreadMessages: 1,
        },
      ]);
    });

    it('should not add a message if the sender is in the ignore list', () => {
      const { default: chatStore } = require('../ChatStore/ChatStore');
      chatStore.__setState({
        ignoreList: [
          {
            userListId: 'foo',
          },
        ],
      });
      pmStore.addPrivateMessage({ userListId: 'foo', message: 'bar' });
      expect(pmStore.state.privateMessages).toEqual([]);
    });
  });

  describe('setPmActiveConversation', () => {
    it('should create an empty conversation if none exists', () => {
      pmStore.setPmActiveConversation('foo');
      expect(pmStore.state.privateMessages).toEqual([
        {
          user: {
            userListId: 'foo',
            userId: null,
            handle: 'foo',
          },
          messages: [
            {
              id: '123',
              message: `${PM_START_MESSAGE} foo`,
              status: true,
            },
          ],
          unreadMessages: 0,
        },
      ]);
    });

    it('should do nothing if selected conversation is same user as new conversation user', () => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
            userId: 'bar',
          },
          messages: [
            {
              id: '123',
              message: `${PM_START_MESSAGE} foo`,
              status: true,
            },
          ],
          unreadMessages: 0,
          disabled: true,
        },
      ];
      pmStore.state.selectedConversation = 'foo';
      pmStore.setPmActiveConversation('foo');
      expect(pmStore.state.privateMessages[0].messages.length).toEqual(1);
    });

    it('should set the selected conversation to the user list ID', () => {
      pmStore.setPmActiveConversation('foo');
      expect(pmStore.state.selectedConversation).toEqual('foo');
    });

    it('should resume a conversation with the same registered user', () => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
            userId: 'bar',
          },
          messages: [
            {
              id: '123',
              message: `${PM_START_MESSAGE} foo`,
              status: true,
            },
          ],
          unreadMessages: 0,
          disabled: true,
        },
      ];

      pmStore.setPmActiveConversation('baz', 'bar');

      expect(pmStore.state.privateMessages).toEqual([
        {
          user: {
            userListId: 'baz',
            userId: 'bar',
          },
          messages: [
            {
              id: '123',
              message: `${PM_START_MESSAGE} foo`,
              status: true,
            },
            {
              id: '123',
              message: 'Conversation resumed',
              status: true,
            },
          ],
          unreadMessages: 0,
          disabled: false,
        },
      ]);
    });
  });

  describe('removeConversation', () => {
    it('should remove a conversation', () => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
            },
            {
              userListId: 'foo',
              message: 'bar',
            },
          ],
        },
        {
          user: {
            userListId: 'bar',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
            },
            {
              userListId: 'foo',
              message: 'bar',
            },
          ],
        },
      ];

      pmStore.removeConversation('foo');
      expect(pmStore.state.privateMessages).toEqual([
        {
          user: {
            userListId: 'bar',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
            },
            {
              userListId: 'foo',
              message: 'bar',
            },
          ],
        },
      ]);
    });
  });

  describe('disableConversation', () => {
    it('should set `disabled` flag to true', () => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [
            {
              userListId: 'foo',
              message: 'bar',
            },
            {
              userListId: 'foo',
              message: 'bar',
            },
          ],
        },
      ];
      pmStore.disableConversation('foo');
      expect(pmStore.state.privateMessages[0].disabled).toEqual(true);
    });

    it('should post a "conversation disabled" message', () => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [],
        },
      ];
      pmStore.disableConversation('foo');
      expect(pmStore.state.privateMessages[0].messages).toEqual([
        {
          id: '123',
          status: true,
          message: 'User has left, convesation has been closed.',
        },
      ]);
    });
  });

  describe('openMenu', () => {
    it('should set menuOpen', () => {
      pmStore.openMenu('foo');
      expect(pmStore.state.menuOpen).toEqual('foo');
    });
  });

  describe('setMessagesRead', () => {
    beforeEach(() => {
      pmStore.state.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [],
          unreadMessages: 1,
        },
        {
          user: {
            userListId: 'bar',
          },
          messages: [],
          unreadMessages: 2,
        },
      ];
    });

    it('should set defined conversation unread to 0', () => {
      pmStore.setMessagesRead('foo');

      const {
        unreadMessages: fooUnread,
      } = pmStore.state.privateMessages.find(c => c.user.userListId === 'foo');

      const {
        unreadMessages: barUnread,
      } = pmStore.state.privateMessages.find(c => c.user.userListId === 'bar');
      expect(fooUnread).toEqual(0);
      expect(barUnread).toEqual(2);
    });
  });

  describe('sendNotification', () => {
    let message;
    let playSpy;
    beforeEach(() => {
      message = {
        status: false,
        clientIsSender: false,
      };
      playSpy = jest.fn(() => Promise.resolve());
      document.getElementById = jest.fn(() => ({
        play: playSpy,
      }));
    });

    it('should emit a notification', (done) => {
      const { default: chatStore } = require('../ChatStore/ChatStore');
      chatStore.__setState({
        sounds: true,
      });
      pmStore.sendNotification(message).then(() => {
        expect(playSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should not emit a notification if sounds are disabled', (done) => {
      const { default: chatStore } = require('../ChatStore/ChatStore');
      chatStore.__setState({
        sounds: false,
      });

      pmStore.sendNotification(message).then(() => {
        expect(playSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not emit a notification if client is the sender', (done) => {
      message.clientIsSender = true;

      pmStore.sendNotification(message).then(() => {
        expect(playSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not emit a notification if previous notification is playing', (done) => {
      pmStore.state.donePlayingNotification = false;

      pmStore.sendNotification(message).then(() => {
        expect(playSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
