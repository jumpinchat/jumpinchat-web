import { ChatStore } from './ChatStore';

jest.mock('../../utils/localStorage');

describe('ChatStore', () => {
  let chatStore;
  beforeEach(() => {
    chatStore = new ChatStore();
  });

  describe('getHandleByUserId', () => {
    it('should get a handle from the user list', () => {
      chatStore.state.users = [
        {
          _id: 'foo',
          handle: 'bar',
        },
      ];

      expect(chatStore.getHandleByUserId('foo')).toEqual('bar');
    });

    it('should return a handle from handleCache if user not in list', () => {
      chatStore.handleCache = { foo: 'bar' };
      expect(chatStore.getHandleByUserId('foo')).toEqual('bar');
    });
  });

  describe('setClientUser', () => {
    it('should set the client user into state', () => {
      chatStore.setClientUser({ foo: 'bar', roles: [] });
      expect(chatStore.state.clientUser).toEqual({ foo: 'bar', roles: [] });
    });

    it('should init the handle cache', () => {
      chatStore.state.users = [
        {
          _id: 'foo',
          handle: 'bar',
        },
      ];

      chatStore.setClientUser({ foo: 'bar', roles: [] });
      expect(chatStore.handleCache).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('addMessage', () => {
    let playSpy;
    beforeEach(() => {
      playSpy = jest.fn(() => Promise.resolve());
      document.getElementById = jest.fn(() => ({ play: playSpy }));
    });

    it('should add a new message to the end of the array', () => {
      const message = { message: 'foo' };

      chatStore.state.clientUser = { id: '123', roles: [] };
      chatStore.state.messages = [{ message: 'bar', isAdmin: false, isSiteMod: false }];

      chatStore.addMessage(message);

      expect(chatStore.state.messages).toEqual([
        { message: 'bar', isAdmin: false, isSiteMod: false },
        { message: 'foo', isAdmin: false, isSiteMod: false },
      ]);
    });

    it('should remove the last message if buffer is at 100', () => {
      const message = { message: 'foo', isAdmin: false, isSiteMod: false };

      chatStore.state.clientUser = { _id: '123', roles: [] };
      chatStore.state.messages = new Array(100)
        .fill({ message: 'bar' })
        .map((v, i) => ({ message: `${i}` }));

      chatStore.addMessage(message);

      expect(chatStore.state.messages[0]).toEqual({ message: '1' });
      expect(chatStore.state.messages[99]).toEqual(message);
      expect(chatStore.state.messages.length).toEqual(100);
    });

    it('should play sound if user ID is not the same as client user ID', () => {
      const message = {
        message: 'foo',
        userId: '123',
      };

      chatStore.state.clientUser = { id: '321', roles: [] };

      chatStore.addMessage(message);
      expect(playSpy).toHaveBeenCalled();
    });

    it('should not play sound if message status is true', () => {
      const message = {
        message: 'foo',
        status: true,
      };

      chatStore.state.clientUser = { _id: '321', roles: [] };

      chatStore.addMessage(message);
      expect(playSpy).not.toHaveBeenCalled();
    });

    it('should not play sound if user ID === client ID', () => {
      const message = {
        message: 'foo',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '321', roles: [] };

      chatStore.addMessage(message);
      expect(playSpy).not.toHaveBeenCalled();
    });

    it('should not play notification when it has not finished playing the last one', () => {
      chatStore.state.donePlayingNotification = false;
      const message = {
        message: 'foo',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', roles: [] };

      chatStore.addMessage(message);
      expect(playSpy).not.toHaveBeenCalled();
    });

    it('should play notification', () => {
      const message = {
        message: 'bar',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', handle: 'foo', roles: [] };

      chatStore.addMessage(message);
      expect(document.getElementById).toHaveBeenCalledWith('notification-sound');
    });

    it('should play mention when message contains "@(username|handle)"', () => {
      const message = {
        message: '@foo',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', handle: 'foo', roles: [] };

      chatStore.addMessage(message);
      expect(document.getElementById).toHaveBeenCalledWith('mention-sound');
    });

    it('should play mention when message contains "@(username|handle)" and requires escape', () => {
      const message = {
        message: '@foo[bar',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', handle: 'foo[bar', roles: [] };

      chatStore.addMessage(message);
      expect(document.getElementById).toHaveBeenCalledWith('mention-sound');
    });

    it('should play mention when message contains multiple "@(username|handle)"', () => {
      const message = {
        message: '@bar: lorum ipsum @foo',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', handle: 'foo', roles: [] };

      chatStore.addMessage(message);
      expect(document.getElementById).toHaveBeenCalledWith('mention-sound');
    });

    it('should set flag when play is finished', (done) => {
      chatStore.donePlayingNotification = true;
      const message = {
        message: 'foo',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', roles: [] };

      const add = chatStore.addMessage(message);
      expect(chatStore.state.donePlayingNotification).toEqual(false);
      add.then(() => {
        expect(chatStore.state.donePlayingNotification).toEqual(true);
        done();
      }).catch(done.fail);
    });

    it('should add to unread messages if window is not focused', () => {
      chatStore.state.windowIsVisible = false;
      const message = {
        message: 'foo',
        userId: '321',
      };

      chatStore.state.clientUser = { _id: '123', roles: [] };

      chatStore.addMessage(message);

      expect(chatStore.state.unreadMessages).toEqual(1);
    });
  });

  describe('saveClientMessage', () => {
    it('should save a message to state', () => {
      chatStore.saveClientMessage('foo');
      expect(chatStore.state.sentMessages).toEqual(['foo']);
    });

    it('should remove the last message in array if length === 5', () => {
      chatStore.state.sentMessages = [
        'foo1',
        'foo2',
        'foo3',
        'foo4',
        'foo5',
      ];

      chatStore.saveClientMessage('bar');
      expect(chatStore.state.sentMessages).toEqual([
        'bar',
        'foo1',
        'foo2',
        'foo3',
        'foo4',
      ]);
    });
  });

  describe('selectPrevMessage', () => {
    it('should select first message in array if prev === true', () => {
      chatStore.state.sentMessages = [
        'foo1',
        'foo2',
        'foo3',
        'foo4',
        'foo5',
      ];

      chatStore.selectPrevMessage(true);
      expect(chatStore.state.chatInputValue).toEqual('foo1');
    });

    it('should do nothing if prev === false and current message is not in array', () => {
      chatStore.state.sentMessages = [
        'foo1',
        'foo2',
        'foo3',
        'foo4',
        'foo5',
      ];

      chatStore.state.chatInputValue = '';

      chatStore.selectPrevMessage(false);
      expect(chatStore.state.chatInputValue).toEqual('');
    });

    it('should select next in array if prev === false and message is in array', () => {
      chatStore.state.sentMessages = [
        'foo1',
        'foo2',
        'foo3',
        'foo4',
        'foo5',
      ];

      chatStore.state.chatInputValue = 'foo2';

      chatStore.selectPrevMessage(false);
      expect(chatStore.state.chatInputValue).toEqual('foo1');
    });
  });


  describe('addUser', () => {
    it('should add a user', () => {
      chatStore.state.users = [];

      chatStore.addUser('foo');
      expect(chatStore.state.users).toEqual(['foo']);
    });

    it('should add handle to handleCache', () => {
      chatStore.addUser({
        _id: 'foo',
        handle: 'bar',
      });

      expect(chatStore.handleCache).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('removeUser', () => {
    it('should remove the user by its list ID', () => {
      const userToRemove = { _id: '123' };

      chatStore.state.users = [
        { _id: '321' },
        userToRemove,
      ];

      chatStore.removeUser(userToRemove);
      expect(chatStore.state.users).toEqual([{ _id: '321' }]);
    });
  });

  describe('updateUser', () => {
    it('should update a user', () => {
      chatStore.state.users = [
        { _id: '123' },
      ];

      chatStore.updateUser({ _id: '123', handle: 'foo' });
      expect(chatStore.state.users).toEqual([{ _id: '123', handle: 'foo' }]);
    });
  });

  describe('updateUserList', () => {
    it('should update existing user if matching ID found', () => {
      chatStore.state.users = [
        { _id: '123' },
      ];

      chatStore.updateUser = jest.fn();
      chatStore.updateUserList({ _id: '123' });
      expect(chatStore.updateUser).toHaveBeenCalledWith({ _id: '123' });
    });

    it('should add user if not found in user list', () => {
      chatStore._room = {
        users: [
          { _id: '123' },
        ],
      };

      chatStore.addUser = jest.fn();
      chatStore.updateUserList({ _id: '321' });
      expect(chatStore.addUser).toHaveBeenCalledWith({ _id: '321' });
    });
  });

  describe('updateModList', () => {
    it('should update mod list', () => {
      chatStore.moderators = [];

      chatStore.updateModList(['foo']);
      expect(chatStore.state.moderators).toEqual(['foo']);
    });
  });

  describe('changeUserHandle', () => {
    it('should change user handle', () => {
      chatStore.state.users = [
        { _id: '123', handle: 'foo' },
      ];


      chatStore.changeUserHandle({ userId: '123', handle: 'bar' });

      expect(chatStore.state.users[0]).toEqual({ _id: '123', handle: 'bar' });
    });

    it('should handle in clientUser state', () => {
      chatStore.setClientUser = jest.fn();
      chatStore.state.clientUser = {
        handle: 'foo',
        _id: '123',
        roles: [],
      };

      chatStore.state.users = [
        { _id: '123', handle: 'foo' },
      ];


      chatStore.changeUserHandle({ userId: '123', handle: 'bar' });

      expect(chatStore.setClientUser)
        .toHaveBeenCalledWith({ _id: '123', handle: 'bar', roles: [] });
    });
  });

  describe('setUserListOption', () => {
    it('should set userListOptionOpen to userId', () => {
      chatStore.setUserListOption('foo');
      expect(chatStore.state.userListOptionOpen).toEqual('foo');
    });
  });

  describe('setMessageSounds', () => {
    it('should set `sounds` to value', () => {
      chatStore.setMessageSounds('foo');
      expect(chatStore.state.sounds).toEqual('foo');
    });
  });

  describe('setShowUserList', () => {
    it('should set showUserList', () => {
      chatStore.setShowUserList(true);
      expect(chatStore.state.showUserList).toEqual(true);
    });
  });

  describe('setWindowIsVisible', () => {
    it('should set windowIsVisible', () => {
      chatStore.state.windowIsVisible = true;
      chatStore.setWindowIsVisible(false);
      expect(chatStore.state.windowIsVisible).toEqual(false);
    });

    it('should set unread messages to 0 if visibility is true', () => {
      chatStore.state.windowIsVisible = false;
      chatStore.state.unreadMessages = 9000;
      chatStore.setWindowIsVisible(true);
      expect(chatStore.state.unreadMessages).toEqual(0);
    });
  });

  describe('selectChatTab', () => {
    it('should set the chat tab', () => {
      chatStore.selectChatTab('foo');
      expect(chatStore.state.chatTab).toEqual('foo');
    });
  });

  describe('sendPmNotification', () => {
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
      chatStore.state.sounds = true;

      chatStore.sendPmNotification(message).then(() => {
        expect(playSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should not emit a notification if sounds are disabled', (done) => {
      chatStore.state.sounds = false;

      chatStore.sendPmNotification(message).then(() => {
        expect(playSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not emit a notification if client is the sender', (done) => {
      chatStore.state.sounds = true;
      message.clientIsSender = true;

      chatStore.sendPmNotification(message).then(() => {
        expect(playSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not emit a notification if previous notification is playing', (done) => {
      chatStore.state.sounds = true;
      chatStore.state.donePlayingNotification = false;

      chatStore.sendPmNotification(message).then(() => {
        expect(playSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('clearMessages', () => {
    it('should remove messages and add a status message', () => {
      chatStore.state.messages = [
        {
          message: 'foo',
        },
      ];

      chatStore.clearMessages();
      expect(chatStore.state.messages.length).toEqual(0);
    });
  });

  describe('setScroll', () => {
    it('should set scroll to fixed if topPosition diff is >= 50', () => {
      chatStore.setScroll(51);
      expect(chatStore.state.scroll.fixScroll).toEqual(true);
    });

    it('should unfix scroll if diff is < 50', () => {
      chatStore.state.scroll.fixScroll = true;
      chatStore.setScroll(20);
      expect(chatStore.state.scroll.fixScroll).toEqual(false);
    });
  });
});
