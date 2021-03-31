/* global jest, expect, describe, it, beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import PmFeed from './PmFeed.react';

describe('<PmFeed />', () => {
  let props;

  beforeEach(() => {
    props = {
      selectedConversation: null,
      chatInputValue: '',
      privateMessages: [],
      onSubmit: jest.fn(),
      onChange: jest.fn(),
      fixScroll: false,
    };
  });

  it('should not show the input if there is no selected conversation', () => {
    const wrapper = shallow(<PmFeed {...props} />);
    expect(wrapper.find('PmInput').length).toEqual(0);
  });

  it('should show the chat input if there is a selected conversation', () => {
    props.selectedConversation = 'foo';
    props.privateMessages = [
      {
        user: {
          userListId: 'foo',
          handle: 'bar',
        },
        messages: [],
      },
    ];
    const wrapper = shallow(<PmFeed {...props} />);
    expect(wrapper.find('PmInput').length).toEqual(1);
  });

  it('should render messages of selected conversation', () => {
    props.selectedConversation = 'foo';

    props.privateMessages = [
      {
        user: {
          userListId: 'foo',
          handle: 'bar',
        },
        messages: [
          {
            id: 'bar1',
            message: 'foo',

          },
          {
            id: 'bar2',
            message: 'foo',

          },
        ],
        disabled: false,
      },
      {
        user: { userListId: 'bar' },
        messages: [
          {
            id: 'baz1',
            message: 'foo',
          },
          {
            id: 'baz2',
            message: 'foo',
          },
        ],
        disabled: false,
      },
    ];

    const wrapper = shallow(<PmFeed {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
