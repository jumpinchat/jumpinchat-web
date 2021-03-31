import React from 'react';
import { shallow } from 'enzyme';
import { RoomChatInput } from './RoomChatInput.react';

describe('<RoomChatInput />', () => {
  let roomChatInput;
  let props;
  beforeEach(() => {
    props = {
      users: [],
      room: 'foo',
      roomOwnerId: null,
      chatInputValue: '',
      emojiPickerOpen: false,
      emojiSearch: {
        results: [],
        query: '',
        selected: 0,
      },
      userState: { user: { hasChangedHandle: true } },
      customEmoji: [],
      roleState: {
        roles: [
          {
            tag: 'everybody',
          },
        ],
      },
    };
    roomChatInput = new RoomChatInput();
    roomChatInput.props = props;
    window.ga = jest.fn();
  });

  describe('handleChange', () => {
    it('should call completeEmoji if colon code is entered', () => {
      const event = {
        target: {
          value: ':foo',
        },
      };
      const wrapper = shallow(<RoomChatInput {...props} />);
      wrapper.instance().completeEmoji = jest.fn();
      wrapper.instance().setChatInputValue = jest.fn();
      wrapper.instance().handleChange(event);
      expect(wrapper.instance().completeEmoji).toHaveBeenCalledWith('foo');
    });

    it('should call setEmojiSearch and close popup if no code entered', () => {
      const event = {
        target: {
          value: 'foo',
        },
      };
      const wrapper = shallow(<RoomChatInput {...props} />);
      wrapper.instance().completeEmoji = jest.fn();
      wrapper.instance().setEmojiSearch = jest.fn();
      wrapper.instance().setChatInputValue = jest.fn();
      wrapper.instance().handleChange(event);
      expect(wrapper.instance().completeEmoji).not.toHaveBeenCalled();
      expect(wrapper.instance().setEmojiSearch).toHaveBeenCalledWith([], null);
    });
  });

  describe('handleAutocomplete', () => {
    let event;
    beforeEach(() => {
      event = {
        preventDefault: jest.fn(),
        keyCode: 9,
      };

      roomChatInput.props = {
        ...props,
        users: [
          { username: 'username', handle: 'foo' },
        ],
      };

      roomChatInput.input = {
        value: 'foo',
      };

      roomChatInput.setChatInputValue = jest.fn();
      roomChatInput.setSelectedEmojiResult = jest.fn();
    });

    it('should prevent default when tab key is pressed', () => {
      roomChatInput.handleAutocomplete(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should only match when input value prefixed with @', () => {
      roomChatInput.input.value = 'foo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.input.value).toEqual('foo');
    });

    it('should match handle', () => {
      roomChatInput.input.value = '@foo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@foo: ');
    });

    it('should match username', () => {
      roomChatInput.input.value = '@username';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@username: ');
    });

    it('should cycle to next match on subsequent <tab>s', () => {
      roomChatInput.props.users = [
        { username: 'username', handle: 'foo' },
        { username: 'username', handle: 'foobaz' },
      ];

      roomChatInput.input.value = '@fo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@foo: ');
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@foobaz: ');
    });

    it('should cycle back to index 0 when the end of matches is reached', () => {
      roomChatInput.props.users = [
        { username: 'username', handle: 'foo' },
        { username: 'username', handle: 'foobaz' },
      ];
      roomChatInput.input.value = '@fo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@foo: ');
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@foobaz: ');
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('@foo: ');
    });

    it('should select next emoji if code entered and Tab pressed', () => {
      roomChatInput.props.emojiSearch.results = [{}, {}];
      roomChatInput.input.value = ':foo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setSelectedEmojiResult).toHaveBeenCalledWith(1);
    });

    it('should select previous emoji if code entered and Shift+Tab pressed', () => {
      roomChatInput.props.emojiSearch.results = [{}, {}];
      roomChatInput.props.emojiSearch.selected = 1;
      event.shiftKey = true;
      roomChatInput.input.value = ':foo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setSelectedEmojiResult).toHaveBeenCalledWith(0);
    });

    it('should select first emoji if code entered and Tab pressed while selecting last', () => {
      roomChatInput.props.emojiSearch.results = [{}, {}];
      roomChatInput.props.emojiSearch.selected = 1;
      event.shiftKey = false;
      roomChatInput.input.value = ':foo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setSelectedEmojiResult).toHaveBeenCalledWith(0);
    });

    it('should select last emoji if code entered and Shift+Tab pressed while selecting first', () => {
      roomChatInput.props.emojiSearch.results = [{}, {}];
      roomChatInput.props.emojiSearch.selected = 0;
      event.shiftKey = true;
      roomChatInput.input.value = ':foo';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setSelectedEmojiResult).toHaveBeenCalledWith(1);
    });

    it('should complete command value with handle', () => {
      roomChatInput.props.users = [
        { username: 'username', handle: 'foo' },
        { username: 'username', handle: 'bar' },
      ];
      roomChatInput.input.value = '/foo f';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('/foo foo');
    });

    it('should complete command value with username', () => {
      roomChatInput.props.users = [
        { username: 'username', handle: 'foo' },
        { username: 'username', handle: 'bar' },
      ];
      roomChatInput.input.value = '/foo us';
      roomChatInput.handleAutocomplete(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('/foo username');
    });
  });

  describe('doSendMessage', () => {
    let event;
    beforeEach(() => {
      event = { preventDefault: jest.fn() };
      roomChatInput.sendMessage = jest.fn();
      roomChatInput.props = {
        ...props,
        room: 'room',
      };
    });

    it('should trim message whitespace', () => {
      roomChatInput.input = {
        value: 'foo ',
      };

      roomChatInput.doSendMessage(event);
      expect(roomChatInput.sendMessage).toHaveBeenCalledWith('foo', 'room');
    });

    it('should not send message if message is empty', () => {
      roomChatInput.input = {
        value: '   ',
      };

      roomChatInput.doSendMessage(event);
      expect(roomChatInput.sendMessage).not.toHaveBeenCalled();
    });

    it('should reset the input value after sending a message', () => {
      roomChatInput.input = {
        value: 'foo',
      };

      roomChatInput.setChatInputValue = jest.fn();

      roomChatInput.props.chatInputValue = 'foo';

      roomChatInput.doSendMessage(event);
      expect(roomChatInput.setChatInputValue).toHaveBeenCalledWith('');
    });
  });

  describe('handleSelectPrevious', () => {
    it('should call restoreMessage on arrow up', () => {
      roomChatInput.restoreMessage = jest.fn();
      roomChatInput.handleSelectPrevious({ code: 'ArrowUp' });
      expect(roomChatInput.restoreMessage).toHaveBeenCalled();
    });

    it('should call restoreMessage with prev false on arrow down', () => {
      roomChatInput.restoreMessage = jest.fn();
      roomChatInput.handleSelectPrevious({ code: 'ArrowDown' });
      expect(roomChatInput.restoreMessage).toHaveBeenCalledWith(false);
    });
  });

  describe('handleGift', () => {
    it('should open a new window to gift support', () => {
      props.roomOwnerId = 'foo';
      window.open = jest.fn();
      const wrapper = shallow(<RoomChatInput {...props} />);
      wrapper.instance().handleGift({ preventDefault: jest.fn() });
      expect(window.open)
        .toHaveBeenCalledWith('/support/payment?productId=onetime&amount=300&beneficiary=foo', '_blank');
    });
  });

  describe('render', () => {
    it('should render the input with an emoji picker', () => {
      const wrapper = shallow(<RoomChatInput {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should render a gift button if the room has an owner', () => {
      props.roomOwnerId = 'foo';
      const wrapper = shallow(<RoomChatInput {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });
});
