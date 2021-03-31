/* global window, it, beforeEach, describe */

import React from 'react';
import { shallow } from 'enzyme';
import YoutubeSearchModal from './YoutubeSearchModal.react';

describe('<YoutubeSearchModal />', () => {
  let youtubeSearchModal;
  beforeEach(() => {
    youtubeSearchModal = new YoutubeSearchModal();
    window.ga = jest.fn();
  });

  describe('_focusInput', () => {
    it('should call focus on the input', () => {
      youtubeSearchModal.input = {
        focus: jest.fn(),
      };

      youtubeSearchModal._focusInput();
      expect(youtubeSearchModal.input.focus).toHaveBeenCalled();
    });
  });

  describe('handleSearch', () => {
    let event;
    beforeEach(() => {
      event = {
        preventDefault: jest.fn(),
      };

      youtubeSearchModal.input = {
        value: 'foo',
      };
      youtubeSearchModal.getSearch = jest.fn();
    });

    it('should prevent default behaviour', () => {
      youtubeSearchModal.handleSearch(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call get search', () => {
      youtubeSearchModal.handleSearch(event);
      expect(youtubeSearchModal.getSearch).toHaveBeenCalledWith('foo');
    });

    it('should not search if trimmed length is < 3', () => {
      youtubeSearchModal.input = {
        value: 'fo ',
      };
      youtubeSearchModal.handleSearch(event);
      expect(youtubeSearchModal.getSearch).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    let props;
    beforeEach(() => {
      props = {
        contentLabel: 'foo',
        resultsLoading: false,
        results: [
          {
            thumb: {
              url: 'foo.bar',
            },
            title: 'foo',
            videoId: '1',
          },
          {
            thumb: {
              url: 'foo.bar',
            },
            title: 'bar',
            videoId: '2',
          },
        ],
      };
    });

    it('should render results', () => {
      const wrapper = shallow(<YoutubeSearchModal {...props} />);

      expect(wrapper.find('YoutubeSearchResult').length).toEqual(2);
    });

    it('should show error message if error is truthy', () => {
      props = { ...props, error: { message: 'foo' } };
      const wrapper = shallow(<YoutubeSearchModal {...props} />);

      expect(wrapper.find('.modal__Error').length).toEqual(1);
      expect(wrapper.find('.modal__Error').text()).toEqual('foo');
    });
  });
});
