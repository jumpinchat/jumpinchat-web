import React from 'react';
import { shallow } from 'enzyme';
import { YoutubeModal } from './YoutubeModal.react';

describe('<YoutubeModal />', () => {
  let props;
  beforeEach(() => {
    props = {
      isOpen: true,
      error: null,
      resultsLoading: false,
      playlist: [{
        _id: 'foo',
        mediaType: 'yt',
        startedBy: {
          userId: 'foo',
          username: 'foobar',
          pic: 'foo.jpg',
        },
        duration: 123,
        title: 'foo',
        description: 'description',
        channelId: 'abc',
        link: 'https://youtu.be/foo',
      }],
    };
  });

  it('should show playlist if search not active', () => {
    const wrapper = shallow(<YoutubeModal {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should not show playlist if search loading', () => {
    props.resultsLoading = true;
    const wrapper = shallow(<YoutubeModal {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });

  it('should not show playlist if search has results', () => {
    props.results = [{

    }];
    const wrapper = shallow(<YoutubeModal {...props} />);
    expect(wrapper.getElement()).toMatchSnapshot();
  });
});
