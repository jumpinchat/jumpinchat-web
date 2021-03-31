import React from 'react';
import { shallow } from 'enzyme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RoomUserListItemIcon from './RoomUserListItemIcon.react';

describe('<RoomUserListItemIcon />', () => {
  let props;
  beforeEach(() => {
    props = {
      roles: [
        {
          isDefault: true,
          name: 'everybody',
          tag: 'everybody',
          icon: {
            color: 'aqua',
          },
        },
        {
          name: 'foo',
          tag: 'foo',
          icon: {
            color: 'aqua',
          },
        },
      ],
      userRoles: ['foo'],
    };
  });

  it('should use tag icon by default', () => {
    const wrapper = shallow(<RoomUserListItemIcon {...props} />);
    expect(wrapper.find(FontAwesomeIcon).props().icon).toEqual(['fas', 'tag']);
  });

  it('should use tag icon by default', () => {
    props.roles[1].icon.name = 'icon';
    const wrapper = shallow(<RoomUserListItemIcon {...props} />);
    expect(wrapper.find(FontAwesomeIcon).props().icon).toEqual(['fas', 'icon']);
  });

  it('should not show a tag for "everybody" role', () => {
    props.userRoles = ['everybody'];
    const wrapper = shallow(<RoomUserListItemIcon {...props} />);
    expect(wrapper.find(FontAwesomeIcon).exists()).toEqual(false);
  });
});
