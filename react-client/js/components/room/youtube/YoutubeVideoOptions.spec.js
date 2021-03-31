/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import YoutubeVideoOptions from './YoutubeVideoOptions.react';

describe('<YoutubeVideoOptions />', () => {
  let youtubeVideoOptions;
  beforeEach(() => {
    youtubeVideoOptions = new YoutubeVideoOptions();
    window.ga = jest.fn();
  });

  describe('componentWillMount', () => {
    it('should set list options', () => {
      youtubeVideoOptions.createListOptions = jest.fn();
      youtubeVideoOptions.componentWillMount();
      expect(youtubeVideoOptions.createListOptions).toHaveBeenCalled();
    });
  });

  describe('handleCloseVideo', () => {
    it('should set video to null', () => {
      youtubeVideoOptions.setYoutubeVideo = jest.fn();
      youtubeVideoOptions.handleCloseVideo();
      expect(youtubeVideoOptions.setYoutubeVideo).toHaveBeenCalledWith(null);
    });
  });

  describe('handleToggleOptions', () => {
    let event;
    beforeEach(() => {
      event = {
        stopPropagation: jest.fn(),
      };
      youtubeVideoOptions.setYoutubeOptions = jest.fn();
    });

    it('should set options to false if true', () => {
      youtubeVideoOptions.props = { ...youtubeVideoOptions.props, open: false };
      youtubeVideoOptions.handleToggleOptions(event);
      expect(youtubeVideoOptions.setYoutubeOptions).toHaveBeenCalledWith(true);
    });

    it('should set options to false if true', () => {
      youtubeVideoOptions.props = { ...youtubeVideoOptions.props, open: true };
      youtubeVideoOptions.handleToggleOptions(event);
      expect(youtubeVideoOptions.setYoutubeOptions).toHaveBeenCalledWith(false);
    });
  });

  describe('createListOptions', () => {
    it('should add a close video option', () => {
      youtubeVideoOptions.props = {
        onSync: jest.fn(),
      };
      const options = youtubeVideoOptions.createListOptions();
      expect(options[0].text).toEqual('Hide video');
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        open: false,
        onSync: jest.fn(),
      };
    });

    it('should have a toggle button', () => {
      const wrapper = shallow(<YoutubeVideoOptions {...props} />);
      expect(wrapper.find('.cams__OptionsTrigger').length).toEqual(1);
    });
  });
});
