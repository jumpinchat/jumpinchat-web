/* global window, jest, expect, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import { RoomCamOptions } from './RoomCamOptions.react';

describe('<RoomCamOptions />', () => {
  let roomCamOptions;
  const event = {
    stopPropagation: jest.fn(),
  };

  window.ga = jest.fn();

  beforeEach(() => {
    roomCamOptions = new RoomCamOptions();
  });

  describe('handleSetOptionsOpen', () => {
    it('should set stream options state', () => {
      roomCamOptions.props = {
        feed: { userId: 'userId' },
      };

      roomCamOptions.setStreamOptionsState = jest.fn();
      roomCamOptions.handleSetOptionsOpen(event);

      expect(roomCamOptions.setStreamOptionsState).toHaveBeenCalled();
      expect(roomCamOptions.setStreamOptionsState).toHaveBeenCalledWith('userId');
    });
  });

  describe('handleHideCam', () => {
    beforeEach(() => {
      roomCamOptions.props = {
        feed: { userId: 'userId' },
      };

      roomCamOptions.setStreamOptionsState = jest.fn();
      roomCamOptions.resumeRemoteStream = jest.fn();
      roomCamOptions.hangupRemoteStream = jest.fn();
    });

    it('should set stream options state', () => {
      roomCamOptions.handleHideCam();
      expect(roomCamOptions.setStreamOptionsState).toHaveBeenCalled();
    });

    it('should resume stream if closed', () => {
      roomCamOptions.props = {
        ...roomCamOptions.props,
        feed: {
          ...roomCamOptions.props.feed,
          userClosed: true,
        },
      };

      roomCamOptions.handleHideCam();
      expect(roomCamOptions.resumeRemoteStream).toHaveBeenCalledWith('userId');
    });

    it('should hangup stream if open', () => {
      roomCamOptions.props = {
        ...roomCamOptions.props,
        feed: {
          ...roomCamOptions.props.feed,
          userClosed: false,
        },
      };

      roomCamOptions.handleHideCam();
      expect(roomCamOptions.hangupRemoteStream).toHaveBeenCalledWith('userId');
    });
  });

  describe('handleBanUser', () => {
    it('should han user by user list ID', () => {
      roomCamOptions.sendOperatorAction = jest.fn();
      roomCamOptions.props = {
        ...roomCamOptions.props,
        user: { _id: 'userId' },
      };

      roomCamOptions.handleBanUser();
      expect(roomCamOptions.sendOperatorAction)
        .toHaveBeenCalledWith('ban', { user_list_id: 'userId' });
    });
  });

  describe('getOptions', () => {
    beforeEach(() => {
      roomCamOptions.props = {
        feed: { userClosed: false },
        clientUser: {
          roles: ['foo'],
        },
        roleState: {
          roles: [{
            tag: 'foo',
            permissions: {
              ban: false,
            },
          }],
        },
      };
    });

    it('should have Restore option if feed is disabled', () => {
      roomCamOptions.props = {
        ...roomCamOptions.props,
        feed: { userClosed: true },
      };

      expect(roomCamOptions.getOptions().map(o => o.text)).toEqual(['Restore cam']);
    });

    it('should show close option if feed is enabled', () => {
      expect(roomCamOptions.getOptions().map(o => o.text)).toEqual(['Hide cam']);
    });

    it('should show ban option if user is mod', () => {
      roomCamOptions.props = {
        ...roomCamOptions.props,
        feed: { userClosed: true },
      };

      roomCamOptions.props.roleState.roles[0].permissions.ban = true;

      expect(roomCamOptions.getOptions().map(o => o.text)).toEqual([
        'Ban user',
        'Restore cam',
      ]);
    });

    it('should show close option if user is mod', () => {
      roomCamOptions.props = {
        ...roomCamOptions.props,
        feed: { userClosed: true },
      };
      roomCamOptions.props.roleState.roles[0].permissions.closeCam = true;

      expect(roomCamOptions.getOptions().map(o => o.text)).toEqual([
        'Close broadcast',
        'Restore cam',
      ]);
    });

    it('should show all mod options if admin', () => {
      roomCamOptions.props = {
        ...roomCamOptions.props,
        feed: { userClosed: true },
        clientUser: {
          isAdmin: true,
          operatorPermissions: {},
        },
      };

      expect(roomCamOptions.getOptions().map(o => o.text)).toEqual([
        'Close broadcast',
        'Ban user',
        'Restore cam',
      ]);
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        clientUser: {
          operatorId: '123',
          roles: ['foo'],
        },
        user: {
          userId: '123',
          is_client_user: false,
        },
        feed: {
          userClosed: false,
        },
        roleState: {
          roles: [{
            tag: 'foo',
            permissions: {
              playMedia: true,
            },
          }],
        },
      };
    });

    it('should not render for client user', () => {
      props = { ...props, user: { is_client_user: true } };
      const wrapper = shallow(<RoomCamOptions {...props} />);
      expect(wrapper.html()).toEqual(null);
    });

    it('should render dropdown button', () => {
      const wrapper = shallow(<RoomCamOptions {...props} />);
      expect(wrapper.find('.cams__OptionsTrigger').length).toEqual(1);
    });
  });
});
