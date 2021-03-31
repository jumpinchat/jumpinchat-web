/* global window, document, describe, it, beforeEach */

import { YoutubeStore } from './YoutubeStore';

jest.mock('../utils/localStorage');

describe('YoutubeStore', () => {
  let youtubeStore;
  beforeEach(() => {
    youtubeStore = new YoutubeStore();
    jest.clearAllMocks();
  });

  describe('setSearchModalState', () => {
    it('should set modal state', () => {
      youtubeStore.setSearchModalState(true);
      expect(youtubeStore.state.searchModalOpen).toEqual(true);
    });
  });

  describe('setSearchResults', () => {
    it('should set the search results', () => {
      youtubeStore.setSearchResults(['foo']);
      expect(youtubeStore.state.searchResults).toEqual(['foo']);
    });
  });

  describe('setCurrentlyPlaying', () => {
    it('should currentlyPlaying', () => {
      youtubeStore.setCurrentlyPlaying('foo');
      expect(youtubeStore.state.currentlyPlaying).toEqual('foo');
    });
  });

  describe('setOptions', () => {
    it('should set options', () => {
      youtubeStore.setOptions('foo');
      expect(youtubeStore.state.optionsOpen).toEqual('foo');
    });
  });

  describe('setVolume', () => {
    it('should set volume', () => {
      youtubeStore.setVolume(0.5);
      expect(youtubeStore.state.volume).toEqual(0.5);
    });
  });
});
