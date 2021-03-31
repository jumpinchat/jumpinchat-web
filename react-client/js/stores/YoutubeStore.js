import { EventEmitter } from 'events';
import { YoutubeDispatcher } from '../dispatcher/AppDispatcher';
import { get, set } from '../utils/localStorage';
import {
  YOUTUBE_MODAL_STATE,
  YOUTUBE_SET_RESULTS,
  YOUTUBE_SET_VIDEO,
  YOUTUBE_SET_OPTIONS,
  YOUTUBE_SET_VOLUME,
  YOUTUBE_SET_RESULTS_LOADING,
  YOUTUBE_SET_VOLUME_CONTROL,
  YOUTUBE_SET_VIDEO_PAUSED,
  YOUTUBE_SET_VIDEO_RESUMED,
  YOUTUBE_SET_PLAYLIST,
  YOUTUBE_SET_PLAYLIST_ITEM_OPTIONS,
  YOUTUBE_CLEAR_SEARCH,
  YOUTUBE_SET_VIDEO_SEEK,
} from '../constants/ActionTypes';

const storageKey = 'youtube';

export class YoutubeStore extends EventEmitter {
  constructor() {
    super();
    const state = get(storageKey);

    this.state = {
      searchModalOpen: false,
      searchResults: [],
      currentlyPlaying: null,
      optionsOpen: false,
      volume: 50,
      playVideos: true,
      resultsLoading: false,
      showVolumeControl: false,
      playlist: [],
      ...state,
    };
  }

  setSearchModalState(open) {
    this.state = { ...this.state, searchModalOpen: open };
  }

  setSearchResults(results) {
    this.state = { ...this.state, searchResults: results };
  }

  setCurrentlyPlaying(videoDetails) {
    this.state = {
      ...this.state,
      currentlyPlaying: videoDetails,
    };
  }

  setPlaylist(playlist) {
    this.state = {
      ...this.state,
      playlist,
    };
  }

  setOptions(optionsOpen) {
    this.state = { ...this.state, optionsOpen };
  }

  setVolume(volume) {
    const state = {
      ...get(storageKey),
      volume,
    };

    set(storageKey, state);

    this.state = { ...this.state, volume };
  }

  setPlayVideos(playVideos) {
    this.state = {
      ...this.state,
      playVideos,
      currentlyPlaying: playVideos ? this.state.currentlyPlaying : null,
    };
  }

  setResultsLoading(resultsLoading) {
    this.state = { ...this.state, resultsLoading };
  }

  setVolumeControl(showVolumeControl) {
    this.state = { ...this.state, showVolumeControl };
  }

  setPlaylistItemOptions(id) {
    this.state = {
      ...this.state,
      playlist: this.state.playlist.map(item => ({
        ...item,
        optionsOpen: item._id === id,
      })),
    };
  }

  getState() {
    return this.state;
  }

  // Emit Change event
  emitChange() {
    this.emit('change');
  }

  // Add change listener
  addChangeListener(callback) {
    this.on('change', callback);
  }

  // Remove change listener
  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}

const youtubeStore = new YoutubeStore();

YoutubeDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case YOUTUBE_MODAL_STATE:
      youtubeStore.setSearchModalState(action.state);
      break;

    case YOUTUBE_SET_RESULTS:
      youtubeStore.setSearchResults(action.results);
      break;

    case YOUTUBE_SET_VIDEO:
      youtubeStore.setCurrentlyPlaying(action.videoDetails);
      break;

    case YOUTUBE_SET_VIDEO_PAUSED:
      youtubeStore.setCurrentlyPlaying(action.videoDetails);
      break;

    case YOUTUBE_SET_VIDEO_RESUMED:
      youtubeStore.setCurrentlyPlaying(action.videoDetails);
      break;

    case YOUTUBE_SET_VIDEO_SEEK:
      youtubeStore.setCurrentlyPlaying(action.videoDetails);
      break;

    case YOUTUBE_SET_OPTIONS:
      youtubeStore.setOptions(action.open);
      break;
    case YOUTUBE_SET_VOLUME:
      youtubeStore.setVolume(action.volume);
      break;
    case YOUTUBE_SET_RESULTS_LOADING:
      youtubeStore.setResultsLoading(action.resultsLoading);
      break;
    case YOUTUBE_SET_VOLUME_CONTROL:
      youtubeStore.setVolumeControl(action.show);
      break;
    case YOUTUBE_SET_PLAYLIST:
      youtubeStore.setPlaylist(action.playlist);
      break;
    case YOUTUBE_SET_PLAYLIST_ITEM_OPTIONS:
      youtubeStore.setPlaylistItemOptions(action.id);
      break;
    case YOUTUBE_CLEAR_SEARCH:
      youtubeStore.setSearchResults([]);
      break;
    default:
      return true;
  }

  // If action was responded to, emit change event
  youtubeStore.emitChange();
  return true;
});

export default youtubeStore;
