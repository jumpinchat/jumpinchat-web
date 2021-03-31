
import { YoutubeDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';

export function setYoutubeSearchModal(state) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_MODAL_STATE,
    state,
  });
}

export function setYoutubeSearchResults(results) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_RESULTS,
    results,
  });
}

export function setYoutubeVideo(videoDetails) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_VIDEO,
    videoDetails,
  });
}

export function setYoutubeOptions(open) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_OPTIONS,
    open,
  });
}

export function closeYoutubeClient() {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_CLIENT_CLOSE_VIDEO,
  });
}

export function closeYoutubeRoom() {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_ROOM_CLOSE_VIDEO,
  });
}

export function setYoutubeVolume(volume) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_VOLUME,
    volume,
  });
}

export function setResultsLoading(resultsLoading) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_RESULTS_LOADING,
    resultsLoading,
  });
}

export function setYoutubeShowVolume(show) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_VOLUME_CONTROL,
    show,
  });
}

export function setVideoPaused(videoDetails) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_VIDEO_PAUSED,
    videoDetails,
  });
}

export function setVideoResumed(videoDetails) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_VIDEO_RESUMED,
    videoDetails,
  });
}

export function setVideoSeek(videoDetails) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_VIDEO_SEEK,
    videoDetails,
  });
}

export function setPlaylist(playlist) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_PLAYLIST,
    playlist,
  });
}

export function setPlaylistItemOptions(id) {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_SET_PLAYLIST_ITEM_OPTIONS,
    id,
  });
}

export function clearYoutubeSearch() {
  YoutubeDispatcher.handleAction({
    actionType: types.YOUTUBE_CLEAR_SEARCH,
  });
}
