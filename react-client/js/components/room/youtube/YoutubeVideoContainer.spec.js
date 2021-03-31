/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import { YoutubeVideoContainer } from './YoutubeVideoContainer.react';
import {
  ERR_YT_DEFAULT,
  ERR_YT_BAD_PARAMS,
  ERR_YT_NO_HTML5,
  ERR_YT_NO_VIDEO,
  ERR_YT_NO_EMBED,
} from '../../../constants/ErrorMessages';

describe('<YoutubeVideoContainer />', () => {
  let youtubeVideoContainer;
  let props;

  beforeEach(() => {
    youtubeVideoContainer = new YoutubeVideoContainer();
    window.ga = jest.fn();
    props = {
      dimensions: {
        width: 100,
        height: 75,
      },
      onVideoReady: jest.fn(),
      videoDetails: {
        mediaId: 'foo',
        pausedAt: null,
        duration: 123,
        startAt: 100,
      },
      showVolumeControl: false,
      userIsOperator: false,
      userState: {
        user: {
          roles: ['foo'],
        },
      },
      roleState: {
        roles: [{
          tag: 'foo',
          permissions: {
            controlVideo: true,
          },
        }],
      },
    };
  });

  describe('handleVideoDidEnd', () => {
    it('should set currently playing to null', () => {
      youtubeVideoContainer.setYoutubeVideo = jest.fn();
      youtubeVideoContainer.checkVideoPlaying = jest.fn();
      youtubeVideoContainer.getPlaylist = jest.fn();
      youtubeVideoContainer.handleVideoDidEnd();
      expect(youtubeVideoContainer.setYoutubeVideo).toHaveBeenCalledWith(null);
    });
  });

  describe('handleVideoReady', () => {
    let event;

    beforeEach(() => {
      event = {
        target: {
          setVolume: jest.fn(),
          seekTo: jest.fn(),
          pauseVideo: jest.fn(),
        },
      };

      youtubeVideoContainer.props = {
        onVideoReady: jest.fn(),
        videoDetails: {
          ...props.videoDetails,
          pausedAt: null,
        },
      };
    });

    it('should call onVideoReady from props', () => {
      youtubeVideoContainer.handleVideoReady(event);
      expect(youtubeVideoContainer.props.onVideoReady).toHaveBeenCalled();
    });

    it('should set youtube video volume on ready', () => {
      youtubeVideoContainer.props.volume = 100;
      youtubeVideoContainer.handleVideoReady(event);
      expect(event.target.setVolume).toHaveBeenCalledWith(100);
    });

    it('should seek to start time', () => {
      youtubeVideoContainer.props.volume = 100;
      youtubeVideoContainer.props.videoDetails = {
        ...props.videoDetails,
        pausedAt: null,
      };
      youtubeVideoContainer.handleVideoReady(event);
      expect(event.target.seekTo).toHaveBeenCalledWith(100);
    });

    it('should pause video if video starts paused', () => {
      youtubeVideoContainer.props.volume = 100;
      youtubeVideoContainer.props.videoDetails = {
        ...props.videoDetails,
        pausedAt: 'foo',
      };
      youtubeVideoContainer.handleVideoReady(event);
      expect(event.target.pauseVideo).toHaveBeenCalled();
    });
  });

  describe('handleSyncVideo', () => {
    it('should should not sync if video paused', () => {
      props.videoDetails.pausedAt = 'foo';
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      wrapper.instance().setYoutubeVideo = jest.fn();
      wrapper.instance().checkVideoPlaying = jest.fn();
      wrapper.instance().handleSyncVideo();
      expect(wrapper.instance().setYoutubeVideo).not.toHaveBeenCalledWith();
    });

    it('should close video', () => {
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      wrapper.instance().setYoutubeVideo = jest.fn();
      wrapper.instance().checkVideoPlaying = jest.fn();
      wrapper.instance().handleSyncVideo();
      expect(wrapper.instance().setYoutubeVideo).toHaveBeenCalledWith(null);
    });

    it('should should recheck for playing video', () => {
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      wrapper.instance().setYoutubeVideo = jest.fn();
      wrapper.instance().checkVideoPlaying = jest.fn();
      wrapper.instance().handleSyncVideo();
      expect(wrapper.instance().checkVideoPlaying).toHaveBeenCalled();
    });
  });

  describe('handleVideoHasError', () => {
    beforeEach(() => {
      youtubeVideoContainer.setYoutubeVideo = jest.fn();
      youtubeVideoContainer.addNotification = jest.fn();
    });

    it('should show notification for bad params', () => {
      const e = { data: 2 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.addNotification).toHaveBeenCalledWith({
        color: 'red',
        message: ERR_YT_BAD_PARAMS,
      });
    });

    it('should show notification when can\'t play in HTML5', () => {
      const e = { data: 5 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.addNotification).toHaveBeenCalledWith({
        color: 'red',
        message: ERR_YT_NO_HTML5,
      });
    });

    it('should show notification when video not found', () => {
      const e = { data: 100 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.addNotification).toHaveBeenCalledWith({
        color: 'red',
        message: ERR_YT_NO_VIDEO,
      });
    });

    it('should show notification when video can not be embedded', () => {
      const e = { data: 101 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.addNotification).toHaveBeenCalledWith({
        color: 'red',
        message: ERR_YT_NO_EMBED,
      });
    });

    it('should show notification no embed message for 150 err too for some reason', () => {
      const e = { data: 150 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.addNotification).toHaveBeenCalledWith({
        color: 'red',
        message: ERR_YT_NO_EMBED,
      });
    });

    it('should show generic error message when error code is not known', () => {
      const e = { data: 9001 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.addNotification).toHaveBeenCalledWith({
        color: 'red',
        message: ERR_YT_DEFAULT,
      });
    });

    it('should hide video on error', () => {
      const e = { data: 1234 };
      youtubeVideoContainer.handleVideoHasError(e);
      expect(youtubeVideoContainer.setYoutubeVideo).toHaveBeenCalledWith(null);
    });
  });

  describe('render', () => {
    it('should set wrapper size to dimensions in props', () => {
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      expect(wrapper.find('.youtube__VideoContainer').props().style).toEqual({
        width: '100px',
        height: '75px',
      });
    });

    it('should contain a youtube component', () => {
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      expect(wrapper.find('.youtube__VideoContainer').length).toEqual(1);
    });

    it('should send mediaId to youtube component', () => {
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      expect(wrapper.find('.youtube__VideoContainer').props().children[0].props.videoId)
        .toEqual('foo');
    });

    it('should have options', () => {
      const wrapper = shallow(<YoutubeVideoContainer {...props} />);
      expect(wrapper.find('YoutubeVideoOptions').length).toEqual(1);
    });
  });
});
