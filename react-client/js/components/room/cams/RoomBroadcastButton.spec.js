/* global window, navigator, expect, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import RoomBroadcastButton from './RoomBroadcastButton.react';

describe('<RoomBroadcastButton />', () => {
  let roomBroadcastButton;
  let props;

  beforeEach(() => {
    roomBroadcastButton = new RoomBroadcastButton();
  });

  describe('startLocalStream', () => {
    it('should list Janus devices', () => {
      navigator.mediaDevices = {
        enumerateDevices: sinon.spy(),
      };

      roomBroadcastButton.props = { roomName: 'foo' };
      roomBroadcastButton.checkCanBroadcast = (n, cb) => cb(null, true);
      roomBroadcastButton._startLocalStream();
      expect(navigator.mediaDevices.enumerateDevices.called).toEqual(true);
    });

    it('should not list devices if user can not broadcast', () => {
      window.Janus = {
        listDevices: sinon.spy(),
      };

      roomBroadcastButton.props = { roomName: 'foo' };
      roomBroadcastButton.checkCanBroadcast = (n, cb) => cb(null, false);
      roomBroadcastButton._startLocalStream();
      expect(window.Janus.listDevices.called).toEqual(false);
    });
  });

  describe('stopLocalStream', () => {
    beforeEach(() => {
      roomBroadcastButton.unpublishOwnFeed = sinon.spy();
      roomBroadcastButton.setCanBroadcast = sinon.spy();
      window.setTimeout = sinon.spy();
    });

    it('should unpublish feed', () => {
      roomBroadcastButton._stopLocalStream();
      expect(roomBroadcastButton.unpublishOwnFeed.called).toEqual(true);
    });

    it('should set can broadcast to false', () => {
      roomBroadcastButton._stopLocalStream();
      expect(roomBroadcastButton.setCanBroadcast.firstCall.args[0]).toEqual(false);
    });

    it('should run a timeout before allowing user to broadcast again', () => {
      roomBroadcastButton._stopLocalStream();
      expect(window.setTimeout.called).toEqual(true);
      expect(window.setTimeout.firstCall.args[1]).toEqual(2000);
    });
  });

  describe('render', () => {
    beforeEach(() => {
      props = {
        canBroadcast: true,
        localStream: null,
        feedCount: 0,
        roomName: 'foo',
      };
    });

    it('should show start broadcasting button if no local stream', () => {
      const wrapper = shallow(<RoomBroadcastButton {...props} />);
      expect(wrapper.props().className).toEqual('cams__Action button button-floating button-blue');
    });

    it('should be disabled if `canBroadcast` is false', () => {
      props = { canBroadcast: false };
      const wrapper = shallow(<RoomBroadcastButton {...props} />);
      expect(wrapper.props().disabled).toEqual(true);
    });

    /**
     * This is the case because Janus requires a 2 second delay before destroying
     * or creating a stream.
     */
    it('should be disabled if `canBroadcast` is false and user has stream', () => {
      props = { canBroadcast: false, localStream: {} };
      const wrapper = shallow(<RoomBroadcastButton {...props} />);
      expect(wrapper.props().disabled).toEqual(true);
    });

    it('should show stop broadcasting button if local stream active', () => {
      props = { canBroadcast: true, localStream: {} };
      const wrapper = shallow(<RoomBroadcastButton {...props} />);
      expect(wrapper.props().className).toEqual('cams__Action button button-floating button-default');
    });

    it('should disable button when feed count is 12', () => {
      props = { canBroadcast: true, feedCount: 12 };
      const wrapper = shallow(<RoomBroadcastButton {...props} />);
      expect(wrapper.props().disabled).toEqual(true);
    });
  });
});
