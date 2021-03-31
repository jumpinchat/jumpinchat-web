import React from 'react';
import { shallow } from 'enzyme';
import { RoomCams } from './RoomCams.react';
import { layouts } from '../../../constants/RoomConstants';

describe('<RoomCams />', () => {
  let roomCams;
  beforeEach(() => {
    const props = {
      room: null,
      feeds: [],
      cams: [],
      canBroadcast: false,
      localStream: null,
      playYoutubeVideos: true,
      localAudioActive: false,
      showYoutubeVolume: false,
      showVolumeControl: false,
      currentlyPlaying: null,
      user: {
        operator_id: null,
        settings: {
          playYtVideos: true,
        },
      },
      layout: layouts.VERTICAL,
      globalVolume: 0,
    };

    roomCams = new RoomCams(props);
  });

  describe('getFeedsUpdated', () => {
    it('should return true if remote feed exists, new local feed added', () => {
      const previousFeeds = [{
        remoteFeed: {
          rfid: 'remote',
        },
      }];

      const newFeeds = [
        ...previousFeeds,
        {},
      ];

      expect(RoomCams.getFeedsUpdated(newFeeds, previousFeeds)).toEqual(true);
    });

    it('should return false if first feed added', () => {
      const previousFeeds = [];

      const newFeeds = [
        ...previousFeeds,
        {},
      ];

      expect(RoomCams.getFeedsUpdated(newFeeds, previousFeeds)).toEqual(false);
    });

    it('should return false if there is no change', () => {
      const previousFeeds = [{
        remoteFeed: {
          rfid: 'remote',
        },
      }];

      const newFeeds = [
        ...previousFeeds,
      ];

      expect(RoomCams.getFeedsUpdated(newFeeds, previousFeeds)).toEqual(false);
    });
  });

  describe('componentWillReceiveProps', () => {
    beforeEach(() => {
      roomCams._getCamDimensions = jest.fn();
    });

    it('should not get dimensions if there are no feeds in next props', () => {
      roomCams.componentWillReceiveProps({ ...roomCams.props, feeds: [] });
      expect(roomCams._getCamDimensions).not.toHaveBeenCalled();
    });

    it('should not get dimensions if current feeds === next feeds', () => {
      roomCams.props = {
        feeds: [
          {
            remoteFeed: { rfid: '123' },
          },
          {
            remoteFeed: { rfid: '321' },
          },
        ],
        globalVolume: 0,
      };
      roomCams.componentWillReceiveProps({
        feeds: [
          {
            remoteFeed: { rfid: '123' },
          },
          {
            remoteFeed: { rfid: '321' },
          },
        ],
      });
      expect(roomCams._getCamDimensions).not.toHaveBeenCalled();
    });

    it('should get cam dimensions if feeds have changed', () => {
      roomCams.props = {
        feeds: [
          {
            remoteFeed: { rfid: '123' },
          },
        ],
      };
      roomCams.componentWillReceiveProps({
        feeds: [
          {
            remoteFeed: { rfid: '123' },
          },
          {
            remoteFeed: { rfid: '321' },
          },
        ],
      });
      expect(roomCams._getCamDimensions).toHaveBeenCalled();
    });

    it('should get cam dimensions if currentlyPlaying changes', () => {
      roomCams.props = {
        feeds: [],
        currentlyPlaying: {
          mediaId: 'foo',
          startAt: '2019-01-29T22:46:26.356Z',
          endTime: '2019-01-29T22:46:26.356Z',
          duration: 123,
        },
      };
      roomCams.componentWillReceiveProps({ feeds: [], currentlyPlaying: null });
      expect(roomCams._getCamDimensions).toHaveBeenCalled();
    });
  });

  describe('getCamDimensions', () => {
    beforeEach(() => {
      roomCams.camwrapper = {
        offsetWidth: 10,
        offsetHeight: 10,
      };

      roomCams.camcontainer = {
        offsetWidth: 5,
        offsetHeight: 5,
      };

      roomCams.containerInternal = {
        offsetWidth: 15,
        offsetHeight: 15,
      };

      roomCams.pack = jest.fn();
      roomCams.setState = jest.fn();
    });

    it('should use current props if nextProps args have no feeds', () => {
      roomCams.props.feeds = [{}];
      roomCams._getCamDimensions();
      expect(roomCams.pack).toHaveBeenCalled();
    });

    it('should call pack with correct values', () => {
      roomCams.props.feeds = [{}, {}, {}];
      roomCams._getCamDimensions();
      expect(roomCams.pack).toHaveBeenCalledWith(3, 10, 15);
    });

    it('should set dimensions into state', () => {
      roomCams.setState = jest.fn();
      roomCams.props.feeds = [{}, {}, {}];
      roomCams.pack = jest.fn(() => ({
        width: 1,
        height: 2,
        x: 3,
        y: 4,
      }));
      roomCams._getCamDimensions();
      expect(roomCams.setState).toHaveBeenCalledWith({
        camDimensions: {
          width: 1,
          height: 2,
          x: 3,
          y: 4,
        },
        camWrapperHeight: 15,
        camContainerWidth: 10,
      });
    });

    it('should use cam wrapper dimensions if video is playing', () => {
      roomCams.setState = jest.fn();
      roomCams.props.feeds = [{}, {}, {}];
      roomCams.props.currentlyPlaying = {
        mediaId: 'foo',
        startAt: '2019-01-29T22:46:26.356Z',
        endTime: '2019-01-29T22:46:26.356Z',
        duration: 123,
      };
      roomCams.pack = jest.fn(() => ({
        width: 1,
        height: 2,
        x: 3,
        y: 4,
      }));
      roomCams._getCamDimensions();
      expect(roomCams.setState).toHaveBeenCalledWith({
        camDimensions: {
          width: 1,
          height: 2,
          x: 3,
          y: 4,
        },
        camWrapperHeight: 15,
        camContainerWidth: 10,
      });
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        localStream: {
          stream: {
            getAudioTracks: jest.fn(() => ([])),
          },
        },
        camBroadcast: true,
        feeds: [
          {
            optionsOpen: false,
            userId: 'foo',
          },
          {
            optionsOpen: false,
            userId: 'bar',
          },
          {
            optionsOpen: false,
            userId: 'baz',
          },
        ],
        cams: [
          { userId: 'foo', stream: {} },
          { userId: 'bar', stream: {} },
          { userId: 'baz', stream: {} },
        ],
        room: {
          name: 'room',
          users: [1, 2, 3, 4],
          settings: {
            modOnlyPlayMedia: false,
          },
          attrs: {
            owner: null,
          },
        },
        users: [],
        playYoutubeVideos: true,
        userCount: 4,
        localAudioActive: false,
        showYoutubeVolume: false,
        showVolumeControl: false,
        user: {
          operator_id: 'foo',
          hasChangedHandle: true,
          settings: {
            playYtVideos: true,
          },
        },
        currentlyPlaying: {
          mediaId: 'foo',
          duration: 123,
          startAt: 0,
          startTime: '2019-01-29T22:46:26.356Z',
          endTime: '2019-01-29T22:46:26.356Z',
        },
        broadcastRestricted: false,
        hasHandleChanged: false,
        layout: layouts.VERTICAL,
        modOnlyPlayMedia: false,
        chatColors: [],
        canPlayMedia: true,
        feedsHighDef: true,
        feedsMuted: false,
        camsDisabled: false,
        settingsOptionsOpen: false,
      };
    });

    describe('footer', () => {
      it('should not show cam footer in vertical layout', () => {
        const wrapper = shallow(<RoomCams {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
      });

      it('should show cam footer in horizontal layout', () => {
        props.layout = layouts.HORIZONTAL;
        const wrapper = shallow(<RoomCams {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
      });
    });

    describe('cams wrapper', () => {
      it('should set max width for more than 2 feeds', () => {
        const wrapper = shallow(<RoomCams {...props} />);

        wrapper.setState({
          camDimensions: { x: 1, y: 1 },
          camWrapperHeight: 75,
          camContainerWidth: 150,
        });

        expect(wrapper.find('.cams__Wrapper').props().style).toEqual({ maxWidth: '100px' });
      });

      it('should not have a style if less than 3 feeds', () => {
        const wrapper = shallow(<RoomCams {...props} />);
        expect(wrapper.find('.cams__Wrapper').props().style).toEqual(undefined);
      });

      it('should not have a max width if width < height', () => {
        const wrapper = shallow(<RoomCams {...props} />);

        wrapper.setState({
          camContainerHeight: 200,
          containerWidth: 75,
        });

        expect(wrapper.find('.cams__Wrapper').props().style).toEqual(undefined);
      });

      it('should render correct number of cam windows', () => {
        const wrapper = shallow(<RoomCams {...props} />);

        expect(wrapper.find('RoomCam').length).toEqual(3);
      });

      describe('YoutubeVideoContainer', () => {
        it('should render youtube container if currentlyPlaying has a value', () => {
          props = {
            ...props,
            currentlyPlaying: {
              duration: 123,
              mediaId: 'foo',
              startAt: 0,
              startTime: '2019-01-29T22:46:26.356Z',
              endTime: '2019-01-29T22:46:26.356Z',
            },
          };
          const wrapper = shallow(<RoomCams {...props} />);
          expect(wrapper.find('YoutubeVideoContainer').length).toEqual(1);
        });

        it('should not render youtube container if `playYoutubeVideos` is false', () => {
          props.user.settings.playYtVideos = false;
          const wrapper = shallow(<RoomCams {...props} />);
          expect(wrapper.find('YoutubeVideoContainer').length).toEqual(0);
        });

        it('should not render youtube container if currentlyPlaying has no value', () => {
          props = { ...props, currentlyPlaying: null };
          const wrapper = shallow(<RoomCams {...props} />);
          expect(wrapper.find('YoutubeVideoContainer').length).toEqual(0);
        });

        it('should send currentlyPlaying value to video container', () => {
          props = {
            ...props,
            currentlyPlaying: {
              duration: 123,
              mediaId: 'foo',
              startTime: '2019-01-29T22:46:26.356Z',
              startAt: 0,
              endTime: '2019-01-29T22:46:26.356Z',
            },
          };
          const wrapper = shallow(<RoomCams {...props} />);
          expect(wrapper.find('YoutubeVideoContainer').props().videoDetails.mediaId)
            .toEqual('foo');
        });
      });
    });
  });
});
