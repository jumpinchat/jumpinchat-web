/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import RoomCamsHeader from './RoomCamsHeader.react';

describe('<RoomCamsHeader />', () => {
  let props;
  beforeEach(() => {
    props = {
      localStream: {
        stream: {
          getAudioTracks: jest.fn(() => ([])),
        },
      },
      canBroadcast: true,
      room: {
        name: 'room',
        users: [1, 2, 3, 4],
        settings: {
          description: 'foo',
        },
        attrs: {
          ageRestricted: false,
        },
      },
      playYoutubeVideos: true,
      feedCount: 3,
      userCount: 4,
      localAudioActive: false,
      showYoutubeVolume: false,
      showVolumeControl: false,
      broadcastRestricted: false,
    };
  });

  describe('broadcast button', () => {
    it('should show the broadcast button', () => {
      const wrapper = shallow(<RoomCamsHeader {...props} />);

      expect(wrapper.find('RoomBroadcastButton').length).toEqual(1);
    });
  });

  describe('local audio actions', () => {
    it('should show the actions if local stream has audio tracks', () => {
      props.localStream.stream.getAudioTracks = jest.fn(() => [{}]);
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.find('RoomCamsLocalAudioActions').length).toEqual(1);
    });

    it('should not show the actions if no local stream', () => {
      props.localStream.stream.getAudioTracks = jest.fn(() => []);
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.find('RoomCamsLocalAudioActions').length).toEqual(0);
    });
  });

  describe('room info', () => {
    it('should display correct room name', () => {
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.find('.cams__RoomName').text()).toEqual('room');
    });

    it('should display correct cam count', () => {
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.find('.cams__StreamCount').text()).toEqual('3');
    });

    it('should show correct user count', () => {
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.find('.cams__ViewerCount').text()).toEqual('4');
    });

    it('should show display pic if one has been set', () => {
      props.room.settings.display = 'foo';
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.find('.cams__RoomDisplayPic').length).toEqual(1);
    });

    it('should show room description if one exists', () => {
      props.room.settings.description = 'foo';
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should not show room description if none exists', () => {
      props.room.settings.description = null;
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show topic if topic set', () => {
      props.room.settings.topic = {
        text: 'such topic',
      };
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });

    it('should show topic instead of description if set', () => {
      props.room.settings.description = 'a description';
      props.room.settings.topic = {
        text: 'such topic',
      };
      const wrapper = shallow(<RoomCamsHeader {...props} />);
      expect(wrapper.getElement()).toMatchSnapshot();
    });
  });
});
