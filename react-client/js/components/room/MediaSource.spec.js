/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import MediaSource from './MediaSource.react';

describe('<MediaSource />', () => {
  let mediaSource;
  let props;
  beforeEach(() => {
    props = {
      device: {
        deviceId: '123',
      },
      type: 'video',
      onSelectDevice: jest.fn(),
      isGold: false,
    };

    mediaSource = new MediaSource(props);
    window.navigator.mediaDevices = {
      getUserMedia: jest.fn(() => Promise.resolve()),
    };
  });

  describe('componentDidMount', () => {
    it('should call attachMediaStream on success', (done) => {
      window.navigator.mediaDevices.getUserMedia = jest.fn(() => Promise.resolve('foo'));

      mediaSource.video = {
        srcObject: null,
      };

      mediaSource.props = {
        ...props,
        device: {
          deviceId: '123',
        },
      };

      mediaSource.componentDidMount().then(() => {
        expect(mediaSource.video.srcObject).toEqual('foo');
        done();
      }).catch(done.fail);
    });

    it('should set modal error when no permission for source', (done) => {
      window.navigator.mediaDevices.getUserMedia = jest.fn(() => new Promise((resolve, reject) => reject({ name: 'PermissionDeniedError' })));

      mediaSource.setModalError = jest.fn();

      mediaSource.video = 'foo';

      mediaSource.props = {
        ...props,
        device: {
          deviceId: '123',
        },
      };

      mediaSource.componentDidMount().then(() => {
        expect(mediaSource.setModalError).toHaveBeenCalled();
        done();
      });
    });

    it('should use gold constraints if user is gold', async () => {
      mediaSource.props = {
        ...props,
        isGold: true,
        device: {
          deviceId: '123',
        },
        videoQuality: {
          id: 'foo',
          dimensions: {
            width: 1,
            height: 2,
          },
          frameRate: 69,
        },
      };

      mediaSource.video = {};
      await mediaSource.componentDidMount();
      expect(window.navigator.mediaDevices.getUserMedia)
        .toHaveBeenCalledWith({
          audio: false,
          video: {
            deviceId: {
              exact: '123',
            },
            frameRate: { ideal: 69, max: 69 },
            width: {
              min: 320,
              ideal: 1,
              max: 1,
            },
            height: {
              min: 240,
              ideal: 2,
              max: 2,
            },
          },
        });
    });
  });

  describe('onSelectDevice', () => {
    beforeEach(() => {
      mediaSource.setMediaSelectionModal = jest.fn();
    });

    it('should call onSelectDevice', () => {
      mediaSource.onSelectDevice();
      expect(mediaSource.props.onSelectDevice)
        .toHaveBeenCalledWith('123', 'video');
    });
  });

  describe('video', () => {
    beforeEach(() => {
      props = {
        ...props,
        device: {
          deviceId: '123',
          label: 'foo',
        },
        type: 'video',
      };
    });

    it('should contain video element', () => {
      const wrapper = shallow(<MediaSource {...props} />);
      expect(wrapper.find('.mediaSources__Source').length).toEqual(1);
    });

    it('should autoplay video', () => {
      const wrapper = shallow(<MediaSource {...props} />);
      expect(wrapper.find('.mediaSources__Source').props().autoPlay).toEqual(true);
    });

    it('should show device label', () => {
      const wrapper = shallow(<MediaSource {...props} />);
      expect(wrapper.find('.mediaSources__SourceLabel').text()).toEqual('foo');
    });
  });
});
