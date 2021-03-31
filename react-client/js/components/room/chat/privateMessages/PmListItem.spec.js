/* global jest, expect, describe, it, beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import PmListItem from './PmListItem.react';

jest.mock('../../../../stores/ChatStore/ChatStore', () => ({
  getHandleByUserId: jest.fn(() => 'foo'),
}));

describe('<PmListItem />', () => {
  let props;
  beforeEach(() => {
    props = {
      user: { userListId: 'foo' },
      unreadMessages: 0,
      selectedConversation: 'convo',
      selectConversation: jest.fn(),
      openMenu: jest.fn(),
      closeConversation: jest.fn(),
      handleClickOutside: jest.fn(),
      disabled: false,
    };
  });

  it('should not show the unread message counter if 0', () => {
    const wrapper = shallow(<PmListItem {...props} />);
    expect(wrapper.find('.pill').length).toEqual(0);
  });

  it('should show the unread message counter if greater than 0', () => {
    props.unreadMessages = 1;
    const wrapper = shallow(<PmListItem {...props} />);
    expect(wrapper.find('.pill').length).toEqual(1);
  });
});
