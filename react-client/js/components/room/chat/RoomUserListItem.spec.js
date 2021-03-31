/* global it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import { RoomUserListItem } from './RoomUserListItem.react';


describe('<RoomUserListItem />', () => {
  let props;

  beforeEach(() => {
    props = {
      roleState: {
        roles: [],
      },
      room: {
        attrs: {
          owner: 'foo',
        },
      },
      user: {
        _id: '123',
        handle: 'foo',
        isBroadcasting: false,
        attrs: {
          userLevel: 0,
        },
        user_id: 'foo',
        isAdmin: false,
        isSupporter: false,
        isSiteMod: false,
        roles: [],
      },
      clientUser: {
        _id: '321',
        handle: 'bar',
      },
    };
  });

  describe('handle', () => {
    it('should show the correct user handle', () => {
      const wrapper = shallow(<RoomUserListItem {...props} />);
      expect(wrapper.find('.userList__UserHandle').text()).toEqual('foo');
    });

    it('should highlight the client user', () => {
      props = { ...props, clientUser: { ...props.clientUser, _id: '123' } };
      const wrapper = shallow(<RoomUserListItem {...props} />);
      expect(wrapper.find('.userList__UserHandle').props().className)
        .toEqual('userList__UserHandle userList__UserHandle-current');
    });
  });

  describe('user icons', () => {
    it('should show no icons for neutral state', () => {
      const wrapper = shallow(<RoomUserListItem {...props} />);
      expect(wrapper.find('.userList__UserIcon-broadcast').length).toEqual(0);
      expect(wrapper.find('.userList__UserIcon-op').length).toEqual(0);
    });

    it('should show broadcast icon if user is broadcasting', () => {
      props = { ...props, user: { ...props.user, isBroadcasting: true } };
      const wrapper = shallow(<RoomUserListItem {...props} />);
      expect(wrapper.find('.userList__UserIcon-broadcast').length).toEqual(1);
    });
  });
});
