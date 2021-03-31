import { CamDispatcher } from '../dispatcher/AppDispatcher';
import { trackEvent } from '../utils/AnalyticsUtil';
import * as types from '../constants/ActionTypes';

export function addRemoteStream(streamData) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_REMOTE_ADD,
    data: streamData,
  });
}

export function destroyRemoteStream(id, userHangup) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_REMOTE_DESTROY,
    id,
    userHangup,
  });
}

export function hangupRemoteStream(id) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_REMOTE_HANGUP,
    id,
  });
}

export function resumeRemoteStream(id) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_REMOTE_RESUME,
    id,
  });
}

export function hangupAllRemoteStreams() {
  trackEvent('Cams', 'Hide all remote cams');
  CamDispatcher.handleAction({
    actionType: types.STREAM_HANGUP_ALL,
  });
}

export function resumeAllRemoteStreams() {
  trackEvent('Cams', 'Resume all remote cams');
  CamDispatcher.handleAction({
    actionType: types.STREAM_RESUME_ALL,
  });
}

export function toggleMuteRemoteStream(userId) {
  trackEvent('Cams', 'Toggle mute single remote cam');
  CamDispatcher.handleAction({
    actionType: types.STREAM_AUDIO_TOGGLE_MUTE,
    userId,
  });
}

export function toggleMuteAllRemoteStreams(mute) {
  trackEvent('Cams', 'Toggle mute all remote cams');
  CamDispatcher.handleAction({
    actionType: types.STREAM_AUDIO_TOGGLE_MUTE_ALL,
    mute,
  });
}

export function setGlobalStreamVolume(volume) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_AUDIO_SET_GLOBAL_VOLUME,
    volume,
  });
}

export function setCanBroadcast(canBroadcast) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_LOCAL_CAN_BROADCAST,
    canBroadcast,
  });
}

export function addLocalStream(stream) {
  trackEvent('Cams', 'Start broadcasting');
  CamDispatcher.handleAction({
    actionType: types.STREAM_LOCAL_ADD,
    data: stream,
  });
}

export function destroyLocalStream(id) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_LOCAL_DESTROY,
    data: id,
  });
}

export function toggleMute(stream) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_REMOTE_ADD,
    data: stream,
  });
}

export function setStreamOptionsState(userId, open) {
  trackEvent('Cams', 'Toggle cam options menu', open);
  CamDispatcher.handleAction({
    actionType: types.SET_STREAM_OPTIONS_STATE,
    userId,
    open,
  });
}

export function setDefaultAudioPtt(forcePtt) {
  CamDispatcher.handleAction({
    actionType: types.SET_DEFAULT_PTT,
    forcePtt,
  });
}

export function setClientAudioPtt(audioPtt) {
  CamDispatcher.handleAction({
    actionType: types.SET_CLIENT_PTT,
    audioPtt,
  });
}

export function setFeedAudioActive(rfid, audioActive) {
  if (!CamDispatcher.isDispatching()) {
    CamDispatcher.handleAction({
      actionType: types.STREAM_AUDIO_SET_ACTIVE,
      rfid,
      audioActive,
    });
  }
}

export function setRemoteFeedVolume(rfid, volume) {
  CamDispatcher.handleAction({
    actionType: types.SET_REMOTE_STREAM_VOLUME,
    rfid,
    volume,
  });
}

export function setFeedVolumeSlider(rfid, show) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_SHOW_VOLUME_SLIDER,
    rfid,
    show,
  });
}


export function setFeedLoading(userId, loading) {
  CamDispatcher.handleAction({
    actionType: types.STREAM_SET_LOADING,
    userId,
    loading,
  });
}

export function setLocalAudioActive(active) {
  CamDispatcher.handleAction({
    actionType: types.SET_LOCAL_AUDIO_ACTIVE,
    active,
  });
}

export function resumeAudioContext() {
  CamDispatcher.handleAction({
    actionType: types.RESUME_AUDIO_CONTEXT,
  });
}

export function setQuality(substream) {
  trackEvent('Cams', 'Set quality', substream);
  CamDispatcher.handleAction({
    actionType: types.STREAM_SET_QUALITY,
    substream,
  });
}

export function setQualityOptions(qualityOptions) {
  CamDispatcher.handleAction({
    actionType: types.SET_QUALITY_OPTIONS,
    qualityOptions,
  });
}
