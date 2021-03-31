/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import RoomChatFeed from './RoomChatFeed.react';

describe('<RoomChatFeed />', () => {
  let roomChatFeed;
  let props;
  beforeEach(() => {
    roomChatFeed = new RoomChatFeed();
    props = {
      roomName: 'foo',
      messages: [
        {
          id: 'foo1',
          message: 'foo1',
          timestamp: new Date(),
        },
        {
          id: 'foo2',
          message: 'foo2',
          timestamp: new Date(),
        },
        {
          id: 'foo3',
          message: 'foo3',
          timestamp: new Date(),
        },
      ],
      room: { name: 'name' },
      currentUser: { username: 'foo', handle: 'bar' },
      emojiPickerOpen: false,
      fixScroll: false,
      emojiSearch: {
        results: [],
        query: '',
        selected: 0,
      },
    };
  });

  describe('shouldComponentUpdate', () => {
    it('should return true if messages have changed', () => {
      const wrapper = shallow(<RoomChatFeed {...props} />);
      const newProps = {
        ...props,
        messages: [
          ...props.messages,
          {
            id: 'foo4',
            message: 'foo4',
            timestamp: new Date(),
          },
        ],
      };
      expect(wrapper.instance().shouldComponentUpdate(newProps)).toEqual(true);
    });

    it('should return true if chat input value has changed', () => {
      props.chatInputValue = 'foo';
      const wrapper = shallow(<RoomChatFeed {...props} />);
      const newProps = {
        ...props,
        chatInputValue: 'bar',
      };
      expect(wrapper.instance().shouldComponentUpdate(newProps)).toEqual(true);
    });

    it('should return false if no changes', () => {
      props.chatInputValue = 'foo';
      const wrapper = shallow(<RoomChatFeed {...props} />);
      const newProps = {
        ...props,
      };
      expect(wrapper.instance().shouldComponentUpdate(newProps)).toEqual(false);
    });
  });

  describe('render', () => {
    it('should have a chat input', () => {
      const wrapper = shallow(<RoomChatFeed {...props} />);
      expect(wrapper.find('RoomChatInput').length).toEqual(1);
    });

    it('should render messages', () => {
      const wrapper = shallow(<RoomChatFeed {...props} />);
      expect(wrapper.find('RoomChatMessages').exists()).toEqual(true);
    });
  });
});
