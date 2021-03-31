/* global jest, expect, describe, it, beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import PmWrapper from './PmWrapper.react';

describe('<PmWrapper />', () => {
  let props;
  const event = {
    preventDefault: jest.fn(),
  };

  beforeEach(() => {
    props = {
      selectedConversation: 'convo',
      chatInputValue: '',
      privateMessages: [],
      roomName: 'room',
    };
  });

  describe('handleChange', () => {
    it('should call setChatInputValue with event target value', () => {
      const wrapper = shallow(<PmWrapper {...props} />);
      wrapper.instance().setChatInputValue = jest.fn();
      wrapper.instance().handleChange({ target: { value: 'foo' } });
      expect(wrapper.instance().setChatInputValue).toHaveBeenCalledWith('foo');
    });
  });

  describe('handleSendMessage', () => {
    it('should not call anything if there is no input value', () => {
      const wrapper = shallow(<PmWrapper {...props} />);
      wrapper.instance().handleSendMessage(event);
      wrapper.instance().sendPrivateMessage = jest.fn();

      expect(wrapper.instance().sendPrivateMessage).not.toHaveBeenCalled();
    });

    it('should call sendPrivateMessage', () => {
      props.chatInputValue = 'foo';
      const wrapper = shallow(<PmWrapper {...props} />);
      wrapper.instance().setChatInputValue = jest.fn();
      wrapper.instance().sendPrivateMessage = jest.fn();
      wrapper.instance().handleSendMessage(event);

      expect(wrapper.instance().sendPrivateMessage).toHaveBeenCalledWith('foo', 'room', 'convo');
    });

    it('should clear the chat input when a message is sent', () => {
      props.chatInputValue = 'foo';
      const wrapper = shallow(<PmWrapper {...props} />);
      wrapper.instance().setChatInputValue = jest.fn();
      wrapper.instance().sendPrivateMessage = jest.fn();
      wrapper.instance().handleSendMessage(event);

      expect(wrapper.instance().setChatInputValue).toHaveBeenCalledWith('');
    });
  });

  describe('render', () => {
    it('should show conversation wrapper if no conversation selected', () => {
      props.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [],
          unreadMessages: 0,
        },
      ];
      props.selectedConversation = null;
      const wrapper = shallow(<PmWrapper {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should not show conversation wrapper if conversation selected', () => {
      props.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [],
        },
      ];
      const wrapper = shallow(<PmWrapper {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show conversation list if there are conversations', () => {
      props.privateMessages = [
        {
          user: {
            userListId: 'foo',
          },
          messages: [],
        },
      ];

      const wrapper = shallow(<PmWrapper {...props} />);

      expect(wrapper.find('PmConversationList').length).toEqual(1);
    });
  });
});
