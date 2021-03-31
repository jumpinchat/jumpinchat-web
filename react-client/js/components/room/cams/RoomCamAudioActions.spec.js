/* global jest, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import RoomCamAudioActions from './RoomCamAudioActions.react';

let event;

describe('<RoomCamAudioActions />', () => {
  beforeEach(() => {
    event = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };
  });

  describe('doToggleAudioMuted', () => {
    it('should call action with feed user ID', () => {
      const roomCamAudioActions = new RoomCamAudioActions();
      roomCamAudioActions.setFeedVolumeSlider = jest.fn();
      roomCamAudioActions.props = {
        feed: {
          userId: '123',
          remoteFeed: { rfid: 'foo' },
          showVolume: false,
        },
      };

      roomCamAudioActions.doToggleAudioMuted(event);
      expect(roomCamAudioActions.setFeedVolumeSlider).toHaveBeenCalledWith('foo', true);
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        isLocalStream: false,
        volume: 100,
        feed: {
          showVolume: false,
        },
      };
    });

    it('should render empty component for a localstream', () => {
      props = { ...props, isLocalStream: true };
      const wrapper = shallow(<RoomCamAudioActions {...props} />);
      expect(wrapper.html()).toEqual(null);
    });

    it('should show volume enabled button if audio is enabled', () => {
      const wrapper = shallow(<RoomCamAudioActions {...props} />);
      expect(wrapper.find('.cams__CamAudioControls').length).toEqual(1);
    });
  });
});
