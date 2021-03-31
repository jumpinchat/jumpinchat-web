import React from 'react';
import { shallow } from 'enzyme';
import ProfileInfo from './Info.react';

describe('ProfileInfo', () => {
  let props;

  beforeEach(() => {
    props = {
      closeModal: jest.fn(),
      ignoreListItem: null,
      profile: {
        userListId: 'foo',
      },
      roomOwner: null,
      user: {
        isAdmin: false,
        operatorPermissions: null,
        user_id: null,
      },
    };
  });

  it('should explain guest user by default', () => {
    props.profile.handle = 'foo';
    const wrapper = shallow(<ProfileInfo {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should show join info if user has join and last seen data', () => {
    props.profile.username = 'foo';
    props.profile.userType = 'awesome';
    props.profile.handle = 'bar';
    props.profile.joinDate = '2019-01-01T00:00:00.000Z';
    props.profile.lastSeen = '2019-01-01T00:00:00.000Z';

    const wrapper = shallow(<ProfileInfo {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should show user type and username', () => {
    props.profile.username = 'foo';
    props.profile.userType = 'awesome';
    props.profile.handle = 'bar';
    const wrapper = shallow(<ProfileInfo {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
