/* global it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import RoomUserIcon from './RoomUserIcon.react';

describe('<RoomUserIcon />', () => {
  let props;

  beforeEach(() => {
    props = {
      isAdmin: false,
      userId: null,
      isSupporter: false,
    };
  });

  it('should show guest icon when user has no user ID', () => {
    const wrapper = shallow(<RoomUserIcon {...props} />);
    expect(wrapper.find('.fa-user-o').length).toEqual(1);
  });

  it('should show registered user icon when user has user ID', () => {
    props = {
      ...props,
      userId: 'foo',
    };

    const wrapper = shallow(<RoomUserIcon {...props} />);
    expect(wrapper.find('.fa-user').length).toEqual(1);
  });

  it('should show admin icon when user is admin', () => {
    props = {
      ...props,
      userId: 'foo',
      isAdmin: true,
    };

    const wrapper = shallow(<RoomUserIcon {...props} />);
    expect(wrapper.find('.fa-user-secret').length).toEqual(1);
  });

  it('should show heart when user is a site supporter', () => {
    props = {
      ...props,
      userId: 'foo',
      isSupporter: true,
    };

    const wrapper = shallow(<RoomUserIcon {...props} />);
    expect(wrapper.find('.fa-heart').length).toEqual(1);
  });

  it('should show admin icon when user is a site supporter and admin', () => {
    props = {
      ...props,
      userId: 'foo',
      isSupporter: true,
      isAdmin: true,
    };

    const wrapper = shallow(<RoomUserIcon {...props} />);
    expect(wrapper.find('.fa-user-secret').length).toEqual(1);
  });
});
