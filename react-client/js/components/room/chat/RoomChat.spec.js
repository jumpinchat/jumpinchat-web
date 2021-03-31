/* global it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import { RoomChat } from './RoomChat.react';
import { layouts } from '../../../constants/RoomConstants';

describe('<RoomChat />', () => {
  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        messages: [{}, {}, {}],
        room: {
          name: 'name',
          attrs: {},
        },
        unreadConversations: 0,
        feedsHighDef: false,
        settingsOptionsOpen: false,
        chatColors: ['foo'],
        playYoutubeVideos: true,
        chatTab: 'CHAT_FEED',
        scroll: {
          fixScroll: false,
        },
        emojiPickerOpen: false,
        emojiSearch: {
          results: [],
          query: null,
          selected: 0,
        },
        customEmoji: [],
        layout: layouts.VERTICAL,
        globalVolume: 0,
      };
    });

    it('should have a chat header', () => {
      const wrapper = shallow(<RoomChat {...props} />);
      expect(wrapper.find('RoomChatHeader').length).toEqual(1);
    });

    it('should have a user list', () => {
      const wrapper = shallow(<RoomChat {...props} />);
      expect(wrapper.find('RoomUserList').length).toEqual(1);
    });

    it('should show the feed if feed selected', () => {
      const wrapper = shallow(<RoomChat {...props} />);
      expect(wrapper.find('RoomChatFeed').length).toEqual(1);
    });

    it('should show the pm list if pms selected', () => {
      props.chatTab = 'CHAT_PM';
      const wrapper = shallow(<RoomChat {...props} />);
      expect(wrapper.find('PmWrapper').length).toEqual(1);
    });
  });
});
