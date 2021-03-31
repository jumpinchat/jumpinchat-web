/* global jest,describe,expect,beforeEach,it */

import { UserStore } from './UserStore';

jest.mock('../utils/localStorage');

describe('UserStore', () => {
  let userStore;
  beforeEach(() => {
    userStore = new UserStore();
    jest.clearAllMocks();
  });

  describe('setUser', () => {
    it('should set the user in state', () => {
      userStore.setUser({ foo: 'bar' });
      expect(userStore.state.user).toEqual({
        user_id: null,
        handle: null,
        hasChangedHandle: false,
        is_client_user: true,
        restoredHandle: null,
        foo: 'bar',
        roles: [],
        settings: {
          darkTheme: false,
          playYtVideos: true,
          pushNotificationsEnabled: true,
        },
      });
    });

    it('should set a restored handle if exists', () => {
      const { get, __setMockData } = require('../utils/localStorage');

      __setMockData('handle', 'foo');

      userStore.setUser({ foo: 'bar' });

      expect(get).toHaveBeenCalledWith('handle');

      expect(userStore.state.user).toEqual({
        user_id: null,
        handle: null,
        hasChangedHandle: false,
        is_client_user: true,
        restoredHandle: 'foo',
        foo: 'bar',
        roles: [],
        settings: {
          darkTheme: false,
          playYtVideos: true,
          pushNotificationsEnabled: true,
        },
      });
    });

    it('should set darkTheme from existing state', () => {
      userStore.state.user.settings.darkTheme = true;
      userStore.setUser({ user_id: 'foo' });
      expect(userStore.state.user.settings).toEqual({
        darkTheme: true,
        playYtVideos: true,
        pushNotificationsEnabled: true,
      });
    });

    it('should set darkTheme from localStorage if exits and user has no ID', () => {
      const { get, __setMockData } = require('../utils/localStorage');

      __setMockData('darkTheme', true);

      userStore.setUser({ user_id: null });

      expect(get).toHaveBeenCalledWith('darkTheme');
    });

    it('should set darkTheme from user argument', () => {
      userStore.state.user.settings.darkTheme = true;
      userStore.setUser({
        user_id: 'foo',
        settings: {
          darkTheme: 'foo',
        },
      });

      expect(userStore.state.user.settings).toEqual({
        darkTheme: 'foo',
        playYtVideos: true,
        pushNotificationsEnabled: true,
      });
    });

    it('should not attempt to fetch theme from storage if user ID is in state', () => {
      userStore.state.user.settings.darkTheme = true;
      userStore.state.user.user_id = 'foo';
      userStore.setUser({
        color: 'foo',
      });

      expect(userStore.state.user.settings).toEqual({
        darkTheme: true,
        playYtVideos: true,
        pushNotificationsEnabled: true,
      });
    });
  });

  describe('changeHandle', () => {
    it('should set new handle in storage', () => {
      const { set } = require('../utils/localStorage');

      userStore.changeHandle({ handle: 'foo' });
      expect(set).toHaveBeenCalledWith('handle', 'foo');
    });

    it('should reset `restoredHandle`', () => {
      userStore.changeHandle({ handle: 'foo' });
      expect(userStore.state.user.restoredHandle).toEqual(null);
    });
  });

  describe('setTheme', () => {
    it('should save theme in storage if there is no user ID', () => {
      const { set } = require('../utils/localStorage');

      userStore.state.user = {
        user_id: null,
      };

      userStore.setTheme(true);
      expect(set).toHaveBeenCalledWith('darkTheme', true);
    });

    it('should not save theme in storage if there is a user ID', () => {
      const { set } = require('../utils/localStorage');

      userStore.state.user = {
        user_id: 'foo',
      };

      userStore.setTheme(true);
      expect(set).not.toHaveBeenCalled();
    });
  });
});
