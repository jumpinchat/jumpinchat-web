/* global jest, expect, describe, it, beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import PmConversationList from './PmConversationList.react';

describe('<PmConversationList />', () => {
  let props;
  beforeEach(() => {
    props = {
      selectedConversation: 'convo',
      privateMessages: [],
      selectConversation: jest.fn(),
      openMenu: jest.fn(),
      closeConversation: jest.fn(),
      handleClickOutside: jest.fn(),
    };
  });

  it('should render list of conversations', () => {
    props.privateMessages = [
      {
        user: { userListId: 'foo' },
        unreadMessages: 0,
      },
      {
        user: { userListId: 'bar' },
        unreadMessages: 0,
      },
    ];

    const wrapper = shallow(<PmConversationList {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should highlight current conversation', () => {
    props.selectedConversation = 'foo';
    props.privateMessages = [
      {
        user: { userListId: 'foo' },
        unreadMessages: 0,
      },
      {
        user: { userListId: 'bar' },
        unreadMessages: 0,
      },
    ];

    const wrapper = shallow(<PmConversationList {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
