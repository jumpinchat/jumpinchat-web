/* global it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import { RoomChatHeader } from './RoomChatHeader.react';
import { chatTabs, layouts } from '../../../constants/RoomConstants';

describe('<RoomChatHeader />', () => {
  let roomChatHeader;
  beforeEach(() => {
    roomChatHeader = new RoomChatHeader();
  });

  describe('onMessageSoundChange', () => {
    beforeEach(() => {
      roomChatHeader.setRoomMessageSounds = jest.fn();
    });

    it('should set message sounds to false if enabled', () => {
      roomChatHeader.props = { messageSounds: true };
      roomChatHeader.onMessageSoundChange();
      expect(roomChatHeader.setRoomMessageSounds).toHaveBeenCalledWith(false);
    });

    it('should set message sounds to true if disabled', () => {
      roomChatHeader.props = { messageSounds: false };
      roomChatHeader.onMessageSoundChange();
      expect(roomChatHeader.setRoomMessageSounds).toHaveBeenCalledWith(true);
    });
  });

  describe('onToggleUserlist', () => {
    beforeEach(() => {
      roomChatHeader.setUserlist = jest.fn();
    });

    it('should set user list to false if enabled', () => {
      roomChatHeader.props = { showUserList: true };
      roomChatHeader.onToggleUserlist();
      expect(roomChatHeader.setUserlist).toHaveBeenCalledWith(false);
    });

    it('should set user list to true if disabled', () => {
      roomChatHeader.props = { showUserlist: false };
      roomChatHeader.onToggleUserlist();
      expect(roomChatHeader.setUserlist).toHaveBeenCalledWith(true);
    });
  });

  describe('selectFeedTab', () => {
    it('should call selectChatTab with `CHAT_FEED`', () => {
      roomChatHeader.selectChatTab = jest.fn();
      roomChatHeader.selectFeedTab();
      expect(roomChatHeader.selectChatTab).toHaveBeenCalledWith('CHAT_FEED');
    });
  });

  describe('selectPmTab', () => {
    it('should call selectChatTab with `CHAT_PM`', () => {
      roomChatHeader.selectChatTab = jest.fn();
      roomChatHeader.selectPrivateMessageTab();
      expect(roomChatHeader.selectChatTab).toHaveBeenCalledWith('CHAT_PM');
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        onToggleChat: jest.fn(),
        chatTab: chatTabs.CHAT_FEED,
        feedsMuted: false,
        messageSounds: true,
        camsDisabled: false,
        chatColors: ['foo'],
        room: {
          name: 'room',
          attrs: {
            owner: 'foo',
          },
          settings: {
            modOnlyPlayMedia: false,
          },
        },
        user: {
          user_id: 'foo',
          settings: {
            darkTheme: false,
          },
        },
        playYoutubeVideos: true,
        unreadConversations: 123,
        chatOpen: true,
        feedsHighDef: false,
        layout: layouts.VERTICAL,
        globalVolume: 0,
      };
    });

    it('should show unread conversation count in pm tab', () => {
      props.unreadConversations = 2;
      const wrapper = shallow(<RoomChatHeader {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });
});
