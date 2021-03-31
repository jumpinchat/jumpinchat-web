/* global jest, it, describe, expect */

import React from 'react';
import { shallow } from 'enzyme';
import RoomChatSettingsMenu from './RoomChatSettingsMenu.react';

jest.mock('../../../actions/UserActions');
jest.mock('../../../utils/UserAPI');
jest.mock('../../../utils/ServiceWorkerUtils');
jest.mock('../../../actions/NotificationActions');

describe('<RoomChatSettingsMenu />', () => {
  let props;
  beforeEach(() => {
    props = {
      open: true,
      user: {
        user_id: 'foo',
      },
      onClick: jest.fn(),
      chatColors: [],
      playYoutubeVideos: true,
      modOnlyPlayMedia: false,
      darkTheme: false,
    };
  });

  describe('onChangeNotifications', () => {
    it('should unsubscribe when unchecked', () => {
      const serviceWorkerUtils = require('../../../utils/ServiceWorkerUtils');
      const wrapper = shallow(<RoomChatSettingsMenu {...props} />);
      wrapper.instance().onChangeNotifications({ target: { checked: false } });
      expect(serviceWorkerUtils.unsubscribeFromNotifications).toHaveBeenCalled();
    });

    it('should subscribe when checked', () => {
      const serviceWorkerUtils = require('../../../utils/ServiceWorkerUtils');
      const wrapper = shallow(<RoomChatSettingsMenu {...props} />);
      wrapper.instance().onChangeNotifications({ target: { checked: true } });
      expect(serviceWorkerUtils.registerPushNotifications).toHaveBeenCalled();
    });

    it('should call setNotificationsEnabled action', () => {
      const userActions = require('../../../actions/UserActions');
      const wrapper = shallow(<RoomChatSettingsMenu {...props} />);
      wrapper.instance().onChangeNotifications({ target: { checked: true } });
      expect(userActions.setNotificationsEnabled).toHaveBeenCalledWith(true);
    });

    it('should call setNotificationsEnabled from user API', () => {
      const userApi = require('../../../utils/UserAPI');
      const wrapper = shallow(<RoomChatSettingsMenu {...props} />);
      wrapper.instance().onChangeNotifications({ target: { checked: true } });
      expect(userApi.setNotificationsEnabled).toHaveBeenCalledWith('foo', true);
    });

    it('should show notification', () => {
      const notificationActions = require('../../../actions/NotificationActions');
      const wrapper = shallow(<RoomChatSettingsMenu {...props} />);
      wrapper.instance().onChangeNotifications({ target: { checked: true } });
      expect(notificationActions.addNotification).toHaveBeenCalledWith({
        color: 'blue',
        message: 'Notifications enabled',
      });

      wrapper.instance().onChangeNotifications({ target: { checked: false } });
      expect(notificationActions.addNotification).toHaveBeenCalledWith({
        color: 'blue',
        message: 'Notifications disabled',
      });
    });
  });
});
