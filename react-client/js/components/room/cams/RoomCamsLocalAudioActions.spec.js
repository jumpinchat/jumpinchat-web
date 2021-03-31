/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import RoomCamsLocalAudioActions from './RoomCamsLocalAudioActions.react';

// TODO use jest damn it!
describe('<RoomCamsLocalAudioActions />', () => {
  let audioActions;

  beforeEach(() => {
    audioActions = new RoomCamsLocalAudioActions();
    audioActions.setAudioState = jest.fn();
    audioActions.setLocalAudioActive = jest.fn();
  });

  describe('enableAudio', () => {
    beforeEach(() => {
      audioActions.setState = jest.fn();
    });

    it('should set audio enabled', () => {
      audioActions.enableAudio();
      expect(audioActions.setAudioState).toHaveBeenCalledWith(true);
    });

    it('should set audio enabled in state', () => {
      audioActions.enableAudio();
      expect(audioActions.setLocalAudioActive).toHaveBeenCalledWith(true);
    });

    xit('should clear audio timeout', () => {
      audioActions.audioTimeout = 'foo';
      window.clearTimeout = jest.fn();
      audioActions.enableAudio();
      expect(window.clearTimeout).toHaveBeenCalledWith('foo');
    });
  });

  describe('setAudioDisabled', () => {
    beforeEach(() => {
      audioActions.setAudioState = jest.fn();
      audioActions.setState = jest.fn();
    });

    it('should set audio disabled', () => {
      audioActions._setAudioDisabled();
      expect(audioActions.setAudioState).toHaveBeenCalledWith(false);
    });

    it('should set audio disabled in state', () => {
      audioActions._setAudioDisabled();
      expect(audioActions.setLocalAudioActive).toHaveBeenCalledWith(false);
    });
  });

  describe('disableAudio', () => {
    beforeEach(() => {
      audioActions._setAudioDisbled = jest.fn();
      window.setTimeout = jest.fn();
    });

    it('should set timeout before disabling audio', () => {
      audioActions.disableAudio();
      expect(window.setTimeout)
        .toHaveBeenCalled();
    });
  });

  describe('handleToggleAudio', () => {
    it('should call `setAudioState` with opposite to current value', () => {
      audioActions.props = {
        localAudioActive: false,
      };
      audioActions.handleToggleAudio();
      expect(audioActions.setAudioState).toHaveBeenCalledWith(true);
    });

    it('should call `setLocalAudioActive` with opposite to current value', () => {
      audioActions.props = {
        localAudioActive: false,
      };
      audioActions.handleToggleAudio();
      expect(audioActions.setLocalAudioActive).toHaveBeenCalledWith(true);
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        localAudioActive: false,
        localStream: {
          stream: {
            getAudioTracks: () => ([{ audioEnabled: true }]),
          },
        },
      };
    });

    it('should appear when there is a local audio feed', () => {
      const wrapper = shallow(<RoomCamsLocalAudioActions {...props} />);
      expect(wrapper.find('.cams__LocalAudioActions').length).toEqual(1);
    });

    it('should not show volume indicator when audio is inactive', () => {
      const wrapper = shallow(<RoomCamsLocalAudioActions {...props} />);
      expect(wrapper.find('AudioVolumeIndicator').length).toEqual(0);
    });

    it('should show volume indicator when audio is active', () => {
      props = {
        ...props,
        localAudioActive: true,
      };
      const wrapper = shallow(<RoomCamsLocalAudioActions {...props} />);
      expect(wrapper.find('AudioVolumeIndicator').length).toEqual(1);
    });

    it('should show default button when audio is ptt and inactive', () => {
      props = {
        ...props,
        localAudioActive: false,
        audioPtt: true,
      };
      const wrapper = shallow(<RoomCamsLocalAudioActions {...props} />);
      expect(wrapper.find('.cams__Action.button-blue').length).toEqual(0);
    });

    it('should show active button when audio is ptt and active', () => {
      props = {
        ...props,
        localAudioActive: true,
        audioPtt: true,
      };
      const wrapper = shallow(<RoomCamsLocalAudioActions {...props} />);
      expect(wrapper.find('.cams__Action.button-blue').length).toEqual(1);
    });
  });
});
