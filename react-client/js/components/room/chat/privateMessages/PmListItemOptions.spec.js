/* global jest, expect, describe, it, beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import PmListItemOptions from './PmListItemOptions.react';

describe('<PmListItemOptions />', () => {
  let props;
  beforeEach(() => {
    props = {
      menuOpen: null,
      handle: 'foo',
      userListId: 'userid',
      onOpenMenu: jest.fn(),
      handleClickOutside: jest.fn(),
      closeConversation: jest.fn(),
    };
  });

  it('should not show the menu if menuOpen is false', () => {
    const wrapper = shallow(<PmListItemOptions {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should show the menu if menuOpen is true', () => {
    props.menuOpen = 'userid';
    const wrapper = shallow(<PmListItemOptions {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
