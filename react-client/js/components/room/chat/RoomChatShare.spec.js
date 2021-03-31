/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import RoomChatShare from './RoomChatShare.react';

describe('<RoomChatShare />', () => {
  let roomChatShare;
  beforeEach(() => {
    roomChatShare = new RoomChatShare({ roomName: 'room' });
    window.ga = jest.fn();
  });

  describe('constructor', () => {
    it('should set room link', () => {
      expect(roomChatShare.link).toEqual('jumpin.chat/room');
    });
  });

  describe('componentWillUnmount', () => {
    it('should destroy the clipboard', () => {
      roomChatShare.clipboard.destroy = jest.fn();
      roomChatShare.componentWillUnmount();
      expect(roomChatShare.clipboard.destroy).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        roomName: 'room',
      };
    });

    it('should render an input with the link as a value', () => {
      const wrapper = shallow(<RoomChatShare {...props} />);
      expect(wrapper.find('.chat__ShareInput').props().defaultValue).toEqual('jumpin.chat/room');
    });
  });
});
