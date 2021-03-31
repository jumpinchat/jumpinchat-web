/* global jest, window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import MediaSelectionModal from './MediaSelectionModal.react';

describe('<MediaSelectionModal />', () => {
  let mediaSelectionModal;
  let props;
  beforeEach(() => {
    window.Janus = {
      attachMediaStream: jest.fn(),
    };

    window.ga = jest.fn();
    navigator.mediaDevices = {
      getDisplayMedia: jest.fn(() => Promise.resolve()),
    };

    props = {
      forcePtt: false,
      isGold: false,
      modal: {
        selectedDevices: {
          audio: 'foo',
          video: 'foo',
        },
        onSelectDevice: jest.fn(),
      },
      videoQuality: {
        id: 'foo',
        dimensions: {
          width: 1,
          height: 2,
        },
        frameRate: 69,
      },
      audioPtt: true,
    };

    mediaSelectionModal = new MediaSelectionModal(props);

    mediaSelectionModal.props = props;
  });

  describe('componentDidUpdate', () => {
    beforeEach(() => {
      mediaSelectionModal.publish = jest.fn();
    });

    it('should publish when audio device has changed', () => {
      const prevProps = {
        modal: {
          selectedDevices: {
            audio: 'bar',
            video: 'bar',
          },
        },
        audioPtt: true,
      };

      mediaSelectionModal.componentDidUpdate(prevProps);
      expect(mediaSelectionModal.publish)
        .toHaveBeenCalledWith(props.videoQuality, 'foo', 'foo', false);
    });
  });

  describe('closeModal', () => {
    it('should close the modal', () => {
      mediaSelectionModal.setMediaSelectionModal = jest.fn();
      mediaSelectionModal.closeModal();
      expect(mediaSelectionModal.setMediaSelectionModal).toHaveBeenCalledWith(false);
    });
  });


  describe('video', () => {
    beforeEach(() => {
      props = {
        ...props,
        modal: {
          ...props.modal,
          mediaType: 'video',
          deviceList: {
            audio: [],
            video: [
              {
                deviceId: '123',
                label: 'foo',
              },
              {
                deviceId: '321',
                label: 'bar',
              },
            ],
          },
        },
      };
    });

    it('should have a close button', () => {
      const wrapper = shallow(<MediaSelectionModal {...props} />);

      expect(wrapper.find('.modal__Button-close').length).toEqual(1);
    });

    describe('video sources', () => {
      it('should render available feeds', () => {
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        // should have 4 as the screenshare source and
        // 'no video' options are always shown in the list
        expect(wrapper.find('MediaSource').length).toEqual(4);
      });

      it('should show error message if error is truthy', () => {
        props = { ...props, error: { message: 'foo' } };
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.find('.modal__Error').length).toEqual(1);
        expect(wrapper.find('.modal__Error').text()).toEqual('foo');
      });

      it('should show an error if no available sources', () => {
        props = {
          ...props,
          modal: {
            ...props.modal,
            deviceList: {
              video: [],
            },
          },
        };
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.find('.modal__Error').length).toEqual(1);
      });
    });

    describe('audio sources', () => {
      beforeEach(() => {
        props = {
          ...props,
          modal: {
            ...props.modal,
            mediaType: 'audio',
            deviceList: {
              audio: [
                {
                  deviceId: '123',
                  label: 'foo',
                },
                {
                  deviceId: '321',
                  label: 'bar',
                },
              ],
              video: [],
            },
          },
        };
      });

      it('should render available feeds', () => {
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.find('MediaSource').length).toEqual(2);
      });

      it('should show error message if error is truthy', () => {
        props = { ...props, error: { message: 'foo' } };
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.find('.modal__Error').length).toEqual(1);
        expect(wrapper.find('.modal__Error').text()).toEqual('foo');
      });

      it('should show an error if no available sources', () => {
        props = {
          ...props,
          modal: {
            ...props.modal,
            deviceList: {
              audio: [],
            },
          },
        };
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.find('.modal__Error').length).toEqual(1);
      });

      it('should show PTT button if forcePtt is false', () => {
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.getElement()).toMatchSnapshot();
      });

      it('should not show PTT button if forcePtt is true', () => {
        props.forcePtt = true;
        const wrapper = shallow(<MediaSelectionModal {...props} />);

        expect(wrapper.getElement()).toMatchSnapshot();
      });
    });
  });
});
