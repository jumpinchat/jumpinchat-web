import React from 'react';
import { shallow } from 'enzyme';
import SettingsRoomUsers from './index';

describe('<SettingsRoomUsers />', () => {
  let props;

  beforeEach(() => {
    props = {
      settings: {
        roles: [
          {
            name: 'role',
            tag: 'role_tag',
          },
          {
            name: 'default',
            tag: 'default',
            isDefault: true,
          },
        ],
        enrollments: [
          {
            username: 'user',
            userId: 'user_id',
            roles: [
              {
                name: 'default',
                roleId: 'default_id',
                tag: 'default',
                enrollmentId: 'enrollment2',
              },
            ],
          },
        ],
      },
    };
  });

  it('should show new user', () => {
    props.settings.enrollments.push({
      new: true,
      roles: [],
      username: 'username2',
      userId: 'foo',
    });

    const wrapper = shallow(<SettingsRoomUsers {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should filter by role tag', () => {
    props.settings.enrollments.push({
      username: 'user2',
      userId: 'user_id2',
      roles: [
        {
          name: 'role',
          roleId: 'role_id',
          tag: 'role_tag',
          enrollmentId: 'enrollment',
        },
        {
          name: 'default',
          roleId: 'default_id',
          tag: 'default',
          enrollmentId: 'enrollment2',
        },
      ],
    });


    const wrapper = shallow(<SettingsRoomUsers {...props} />);
    wrapper.instance().setState({ filter: 'role_tag' });
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
