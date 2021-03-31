import React from 'react';
import { shallow } from 'enzyme';
import { RoomUserList } from './RoomUserList.react';

describe('<RoomUserList />', () => {
  let props;
  beforeEach(() => {
    props = {
      room: {},
      roleState: {
        roles: [
          {
            tag: 'everybody',
            order: 0,
          },
          {
            tag: 'mods',
            order: 1,
          },
          {
            tag: 'role1',
            order: 2,
          },
          {
            tag: 'role2',
            order: 3,
          },
        ],
      },
      users: [
        {
          _id: '1',
          handle: 'guest',
          roles: ['everybody'],
        },
        {
          _id: '2',
          handle: 'mods',
          roles: ['everybody', 'mods'],
        },
        {
          _id: '3',
          handle: 'role1',
          roles: ['everybody', 'role1'],
        },
        {
          _id: '4',
          handle: 'role1mods',
          roles: ['everybody', 'mods', 'role1'],
        },
        {
          _id: '5',
          handle: 'role2',
          roles: ['everybody', 'role2'],
        },
        {
          _id: '7',
          handle: 'admin',
          user_id: 'admin',
          roles: ['everybody'],
          isAdmin: true,
        },
      ],
      user: {},
      optionsOpen: null,
      showUserList: true,
    };
  });

  it('should order list items', () => {
    const wrapper = shallow(<RoomUserList {...props} />);
    expect(wrapper.find('RoomUserListItem').map(i => i.props().user.handle)).toEqual([
      'admin',
      'role2',
      'role1',
      'role1mods',
      'mods',
      'guest',
    ]);
  });

  it('should put users with missing role at the end', () => {
    props.users = [
      {
        _id: '8',
        handle: 'norole',
        user_id: 'norole',
        roles: [],
        isAdmin: false,
      },
      ...props.users,
    ];

    const wrapper = shallow(<RoomUserList {...props} />);
    expect(wrapper.find('RoomUserListItem').map(i => i.props().user.handle)).toEqual([
      'admin',
      'role2',
      'role1',
      'role1mods',
      'mods',
      'guest',
      'norole',
    ]);
  });
});
