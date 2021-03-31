import React from 'react';
import { shallow } from 'enzyme';
import { RoomCamOptions } from './RoomCamOptions.react';

describe('<RoomCamOptions />', () => {
  let props;
  beforeEach(() => {
    props = {
      user: {
        operator_id: null,
        user_id: null,
        settings: {
          darkTheme: false,
        },
        roles: ['foo'],
      },
      roleState: {
        roles: [{
          tag: 'foo',
          permissions: {
            playMedia: true,
          },
        }],
      },
      roomName: 'foo',
      feedsCount: 0,
      feedsMuted: false,
      camsDisabled: false,
      chatColors: ['1', '2'],
      playYoutubeVideos: false,
      feedsHighDef: false,
      settingsOptionsOpen: false,
      modOnlyPlayMedia: false,
      layout: 'horizontal',
      roomHasOwner: false,
      globalVolume: 0,
    };
  });

  it('should not show the play video button if room is not registered', () => {
    props.user.user_id = 'foo';
    props.roomHasOwner = false;
    const wrapper = shallow(<RoomCamOptions {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should show the play video button if room is registered', () => {
    props.user.user_id = 'foo';
    props.roomHasOwner = true;
    const wrapper = shallow(<RoomCamOptions {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
