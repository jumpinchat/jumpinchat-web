/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { RoomCam } from './RoomCam.react';

describe('<RoomCam />', () => {
  let cam;

  beforeEach(() => {
    cam = {
      optionsOpen: false,
      streamData: null,
      feed: null,
      users: [],
      user: { hasChangedHandle: false },
      dimensions: {
        width: 0, height: 0, x: 0, y: 0,
      },
      index: 0,
      videoEnabled: false,
    };
  });

  describe('componentDidMount()', () => {
    let roomCam;

    beforeEach(() => {
      roomCam = new RoomCam();
      roomCam.initHark = sinon.spy();
      roomCam._attachStream = sinon.spy();
    });

    it('should call attachStream if streamData and stream set', () => {
      roomCam.props = {
        streamData: {},
      };

      roomCam.stream = {};

      roomCam._attachStream = sinon.spy();

      roomCam.componentDidMount();
      expect(roomCam._attachStream.called).toEqual(true);
    });

    xit('should init hark', () => {
      roomCam.stream = {};
      roomCam.props = {
        streamData: { },
      };
      roomCam.componentDidMount();
      expect(roomCam.initHark.called).toEqual(true);
    });

    it('should not call attachStream if streamData not set', () => {
      roomCam.props = {
        streamData: null,
      };

      roomCam.stream = {};

      roomCam.componentDidMount();
      expect(roomCam._attachStream.called).toEqual(false);
    });

    it('should not call attachStream if no stream', () => {
      roomCam.props = {
        streamData: {},
      };

      roomCam.stream = null;

      roomCam.componentDidMount();
      expect(roomCam._attachStream.called).toEqual(false);
    });
  });

  describe('shouldComponentUpdate()', () => {
    let roomCam;
    beforeEach(() => {
      roomCam = new RoomCam(cam);
    });

    it('should not update if props have not changed', () => {
      cam = {
        ...cam,
        feed: {
          audioEnabled: true,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate(cam)).toEqual(false);
    });

    it('should update if audioActive has changed', () => {
      cam = {
        ...cam,
        feed: {
          audioActive: true,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate({ ...cam, feed: { audioActive: false } }))
        .toEqual(true);
    });

    it('should update if volume has changed', () => {
      cam = {
        ...cam,
        feed: {
          volume: 100,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate({ ...cam, feed: { volume: 0 } }))
        .toEqual(true);
    });

    it('should update if videoEnabled has changed', () => {
      cam = {
        ...cam,
        feed: {
          audioEnabled: true,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate({ ...cam, videoEnabled: false }))
        .toEqual(true);
    });

    it('should update if optionsOpen has changed', () => {
      cam = {
        ...cam,
        feed: {
          audioEnabled: true,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate({ ...cam, optionsOpen: true }))
        .toEqual(true);
    });

    it('should update if handle has changed', () => {
      cam = {
        ...cam,
        feed: {
          audioEnabled: true,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foobar');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate(cam)).toEqual(true);
    });

    it('should update if dimensions have changed', () => {
      cam = {
        ...cam,
        feed: {
          audioEnabled: true,
        },
        videoEnabled: true,
        streamData: {
          token: '123',
        },
        optionsOpen: false,
      };

      roomCam.props = cam;
      roomCam.state.handle = 'foo';

      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.stub().returns('123');

      expect(roomCam.shouldComponentUpdate({
        ...cam,
        dimensions: {
          width: 20,
          height: 20,
        },
      }))
        .toEqual(true);
    });
  });

  describe('componentWillUpdate', () => {
    let roomCam;

    beforeEach(() => {
      roomCam = new RoomCam();
    });

    it('should get the user\'s handle', () => {
      roomCam.chatStore.getHandleByUserId = sinon.spy();
      roomCam._getUserId = sinon.spy();

      roomCam.componentWillUpdate();
      expect(roomCam.chatStore.getHandleByUserId.called).toEqual(true);
    });

    it('should set handle to state if it is set in store', () => {
      roomCam.chatStore.getHandleByUserId = sinon.stub().returns('foo');
      roomCam._getUserId = sinon.spy();
      roomCam.setState = sinon.spy();

      roomCam.componentWillUpdate();

      // eql compares object values instead of instances
      expect(roomCam.setState.firstCall.args[0]).toEqual({ handle: 'foo' });
    });
  });

  describe('componentDidUpdate', () => {
    let roomCam;

    beforeEach(() => {
      roomCam = new RoomCam();
      roomCam.initHark = sinon.spy();
      roomCam.stream = {
        volume: 0,
      };

      roomCam.props = {
        user: {
          hasChangedHandle: false,
        },
        streamData: {},
        feed: { volume: 1 },
      };
    });

    it('should attach stream if token is different', () => {
      roomCam.props = {
        ...roomCam.props,
        streamData: { token: 'foo' },
        videoEnabled: true,
      };

      roomCam._attachStream = sinon.spy();

      const newProps = {
        streamData: {},
        videoEnabled: true,
        feed: { volume: 1 },
      };

      roomCam.componentDidUpdate(newProps);
      expect(roomCam._attachStream.called).toEqual(true);
    });

    it('should attach stream if videoEnabled is different', () => {
      roomCam.props = {
        ...roomCam.props,
        streamData: { token: 'foo' },
        videoEnabled: false,
      };

      roomCam._attachStream = sinon.spy();

      const newProps = {
        ...roomCam.props,
        streamData: { token: 'foo' },
        videoEnabled: true,
      };

      roomCam.componentDidUpdate(newProps);
      expect(roomCam._attachStream.called).toEqual(true);
    });

    xit('should init hark if it is not already initialised', () => {
      roomCam.hark = null;
      roomCam.props = { ...roomCam.props, streamData: { stream: null } };
      roomCam.componentDidUpdate({ ...roomCam.props });
      expect(roomCam.initHark.called).toEqual(true);
    });

    it('should stop hark if stream disappears', () => {
      const stopHarkSpy = sinon.spy();
      roomCam.hark = { stop: stopHarkSpy };

      roomCam.props = { ...roomCam.props, streamData: { stream: null } };
      roomCam.componentDidUpdate({ ...roomCam.props });
      expect(stopHarkSpy.called).toEqual(true);
    });

    it('should destroy hark if stream disappears', () => {
      roomCam.hark = { stop: sinon.spy() };

      roomCam.props = { ...roomCam.props, streamData: { stream: null } };
      roomCam.componentDidUpdate({ ...roomCam.props });
      expect(roomCam.hark).toEqual(null);
    });

    it('should set the stream volume to feed.volume / 100', () => {
      roomCam.props = {
        ...roomCam.props,
        feed: {
          ...roomCam.props.feed,
          volume: 100,
        },
      };

      roomCam.componentDidUpdate({ ...roomCam.props });
      expect(roomCam.stream.volume).toEqual(1);
    });

    it('should set the stream volume to 0 if undefined', () => {
      roomCam.props = {
        ...roomCam.props,
        feed: {
          ...roomCam.props.feed,
          volume: undefined,
        },
      };

      roomCam.componentDidUpdate({ ...roomCam.props });
      expect(roomCam.stream.volume).toEqual(0);
    });
  });

  describe('componentWillUnmount', () => {
    let roomCam;

    beforeEach(() => {
      roomCam = new RoomCam();
      roomCam.stream = {
        volume: 1,
      };
    });

    it('should stop hark', () => {
      roomCam.hark = {
        stop: sinon.spy(),
      };

      roomCam.componentWillUnmount();
      expect(roomCam.hark.stop.called).toEqual(true);
    });
  });

  describe('_attachStream', () => {
    let roomCam;

    beforeEach(() => {
      roomCam = new RoomCam();
    });

    it('should init hark', () => {
      roomCam.initHark = jest.fn();
      roomCam.stream = {};

      const stream = {
        getAudioTracks: jest.fn(() => ([{}])),
      };

      roomCam.props = {
        streamData: {
          stream,
        },
      };

      roomCam.initHark = jest.fn();

      roomCam._attachStream();

      expect(roomCam.initHark).toHaveBeenCalled();
    });
  });

  describe('isStreamLocal', () => {
    let roomCam;
    beforeEach(() => {
      roomCam = new RoomCam();
    });

    it('should return true if streamData is set to local', () => {
      roomCam.props = {
        streamData: {
          stream: {},
          isLocal: true,
        },
      };

      expect(roomCam._isStreamLocal()).toEqual(true);
    });

    it('should return false if no stream', () => {
      roomCam.props = {
        streamData: {
          stream: null,
          isLocal: true,
        },
      };

      expect(roomCam._isStreamLocal()).toEqual(false);
    });

    it('should return false if isLocal is false', () => {
      roomCam.props = {
        streamData: {
          stream: {},
          isLocal: false,
        },
      };

      expect(roomCam._isStreamLocal()).toEqual(false);
    });
  });

  describe('handleClickWrapper', () => {
    it('should set stream options state', () => {
      const roomCam = new RoomCam();
      roomCam.setStreamOptionsState = sinon.spy();

      roomCam.props = {
        streamData: { token: 'foo' },
      };

      roomCam._handleClickWrapper();
      expect(roomCam.setStreamOptionsState.firstCall.args).toEqual(['foo', false]);
    });
  });

  describe('getUserId', () => {
    it('should return id from user object if local stream', () => {
      const roomCam = new RoomCam();
      roomCam._isStreamLocal = sinon.stub().returns(true);

      const props = {
        user: { _id: 'foo' },
        streamData: { userId: 'bar' },
      };

      expect(roomCam._getUserId(props)).toEqual('foo');
    });

    it('should return id from stream data if remote stream', () => {
      const roomCam = new RoomCam();
      roomCam._isStreamLocal = sinon.stub().returns(false);

      const props = {
        user: { _id: 'foo' },
        streamData: { userId: 'bar' },
      };

      expect(roomCam._getUserId(props)).toEqual('bar');
    });
  });

  describe('getHandle', () => {
    it('should return id from client user object if stream is local', () => {
      const roomCam = new RoomCam();
      roomCam._isStreamLocal = sinon.stub().returns(true);

      roomCam.props = {
        user: { handle: 'foo' },
        users: [
          { _id: '123', handle: 'bar' },
          { _id: '321', handle: 'baz' },
        ],
        streamData: { userId: '123' },
      };

      expect(roomCam._getHandle()).toEqual('foo');
    });

    it('should return id from user list if stream is remote', () => {
      const roomCam = new RoomCam();
      roomCam._isStreamLocal = sinon.stub().returns(false);

      roomCam.props = {
        user: { handle: 'foo' },
        users: [
          { _id: '123', handle: 'bar' },
          { _id: '321', handle: 'baz' },
        ],
        streamData: { userId: '123' },
      };

      expect(roomCam._getHandle()).toEqual('bar');
    });
  });

  describe('getCamUser', () => {
    it('should return client user object if stream is local', () => {
      const roomCam = new RoomCam();
      roomCam._isStreamLocal = sinon.stub().returns(true);

      roomCam.props = {
        user: { handle: 'foo' },
        users: [
          { _id: '123', handle: 'bar' },
          { _id: '321', handle: 'baz' },
        ],
        streamData: { userId: '123' },
      };

      expect(roomCam._getCamUser()).toEqual({ handle: 'foo' });
    });

    it('should return user from user list if stream is remote', () => {
      const roomCam = new RoomCam();
      roomCam._isStreamLocal = sinon.stub().returns(false);

      roomCam.props = {
        user: { handle: 'foo' },
        users: [
          { _id: '123', handle: 'bar' },
          { _id: '321', handle: 'baz' },
        ],
        streamData: { userId: '123' },
      };

      expect(roomCam._getCamUser()).toEqual({ _id: '123', handle: 'bar' });
    });
  });

  describe('getCamAudioTracks', () => {
    it('should get audio track if stream exists', () => {
      const roomCam = new RoomCam();

      roomCam.props = {
        user: { handle: 'foo' },
        users: [
          { _id: '123', handle: 'bar' },
          { _id: '321', handle: 'baz' },
        ],
        streamData: {
          stream: {
            getAudioTracks: () => (['track1', 'track2']),
          },
        },
      };

      expect(roomCam._getCamAudioTracks()).toEqual('track1');
    });

    it('should return null if no stream', () => {
      const roomCam = new RoomCam();

      roomCam.props = {
        user: { handle: 'foo' },
        users: [
          { _id: '123', handle: 'bar' },
          { _id: '321', handle: 'baz' },
        ],
        streamData: {
          stream: null,
        },
      };

      expect(roomCam._getCamAudioTracks()).toEqual(null);
    });
  });

  describe('handleReport', () => {
    it('should set report with user list ID from feed', () => {
      const roomCam = new RoomCam();
      roomCam.props = {
        feed: { userId: 'foo' },
      };

      roomCam.setReportModal = jest.fn();
      roomCam.handleReport();
      expect(roomCam.setReportModal).toHaveBeenCalledWith(true, 'foo');
    });
  });

  describe('Component Tests', () => {
    describe('container element', () => {
      it('should render nothing if no dimensions', () => {
        const props = {
          ...cam,
          dimensions: null,
          streamData: {},
        };

        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
      });

      it('should contain cam options', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: false,
            stream: {},
          },
          user: { _id: '123', is_client_user: true },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };

        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('RoomCamOptions').length).toEqual(1);
      });

      it('should contain cam audio actions', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: false,
            stream: {},
          },
          user: { _id: '123', is_client_user: true },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };

        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('RoomCamAudioActions').length).toEqual(1);
      });

      it('should have dimensions set to inline styles', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: false,
            stream: {},
          },
          user: { _id: '123', is_client_user: true },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };

        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.first().props().style).toEqual({ width: '1px', height: '2px' });
      });
    });

    describe('cam overlay', () => {
      let baseProps;
      beforeEach(() => {
        baseProps = {
          ...cam,
          streamData: {
            stream: {},
          },
          user: { _id: '123', is_client_user: true },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
          videoEnabled: true,
        };
      });

      it('should have noCam class if no stream', () => {
        const props = {
          ...baseProps,
          streamData: {
            stream: null,
          },
        };

        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__CamOverlay-noCam').length).toEqual(1);
      });

      it('should have noCam class if video disabled', () => {
        const props = {
          ...baseProps,
          videoEnabled: false,
        };

        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__CamOverlay-noCam').length).toEqual(1);
      });

      it('should not have noCam class if video enabled', () => {
        const wrapper = shallow(<RoomCam {...baseProps} />);
        expect(wrapper.find('.cams__CamOverlay-noCam').length).toEqual(0);
      });

      it('should have open class if options open', () => {
        const props = {
          ...baseProps,
          feed: {
            ...baseProps.feed,
            video: 'foo',
          },
          optionsOpen: true,
        };
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__CamOverlay').props().className)
          .toEqual('cams__CamOverlay open');
      });
    });

    describe('video element', () => {
      let props;
      beforeEach(() => {
        props = {
          ...cam,
          streamData: {
            isLocal: true,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
      });

      it('should have a video element', () => {
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.containsMatchingElement(<video />)).toEqual(true);
      });

      it('should be muted if stream is local', () => {
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('video').props()).toEqual({
          className: 'cams__CamVideo',
          autoPlay: true,
          playsInline: true,
          muted: true,
        });
      });

      it('should not be muted if stream is remote', () => {
        props = { ...props, streamData: { ...props.streamData, isLocal: false } };
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('video').props()).toEqual({
          className: 'cams__CamVideo',
          autoPlay: true,
          playsInline: true,
          muted: false,
        });
      });
    });

    describe('handle', () => {
      it('should show the handle', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: true,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__CamHandle').length).toEqual(1);
      });

      it('should show the correct handle', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: true,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        wrapper.setState({ handle: 'foo' });
        wrapper.update();
        expect(wrapper.find('.cams__CamHandle').text()).toEqual('foo');
      });
    });

    describe('fullscreen option', () => {
      it('should not show fullscreen option when stream is localstream', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: true,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        wrapper.setState({ handle: 'foo' });
        wrapper.update();
        expect(wrapper.find('.cams__FullscreenOption').length).toEqual(0);
      });

      it('should show fullscreen option when stream is remote', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: false,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        wrapper.setState({ handle: 'foo' });
        wrapper.update();
        expect(wrapper.find('.cams__FullscreenOption').length).toEqual(1);
      });

      it('should show mic icon if stream is audio-only', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: false,
            stream: {},
          },
          user: { _id: '123' },
          feed: {},
          videoEnabled: true,
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__CamOverlay-micOnly').length).toEqual(1);
      });

      it('should show report icon if remote stream', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: false,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__ReportAction').length).toEqual(1);
      });

      it('should not show report icon if localstream', () => {
        const props = {
          ...cam,
          streamData: {
            isLocal: true,
            stream: {},
          },
          user: { _id: '123' },
          feed: { audioEnabled: true },
          dimensions: { width: 1, height: 2 },
        };
        const wrapper = shallow(<RoomCam {...props} />);
        expect(wrapper.find('.cams__ReportAction').length).toEqual(0);
      });
    });
  });
});
