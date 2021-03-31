/**
 * Created by Zaccary on 23/05/2016.
 */

import { ModalDispatcher } from '../dispatcher/AppDispatcher';
import { trackEvent } from '../utils/AnalyticsUtil';

import {
  HANDLE_MODAL_STATE,
  BANLIST_MODAL_STATE,
  MEDIA_MODAL_STATE,
  MEDIA_MODAL_TYPE,
  MEDIA_MODAL_SET_DEVICE_ID,
  MEDIA_MODAL_SET_AUDIO_PTT,
  MEDIA_MODAL_LOADING,
  MODAL_ERROR,
  INFO_MODAL_STATE,
  REPORT_MODAL_STATE,
  SET_JOIN_CONDITION_MODAL,
  SET_PROFILE_MODAL,
  SET_IGNORE_MODAL,
  SET_BAN_MODAL,
} from '../constants/ActionTypes';

export function setHandleModal(state) {
  ModalDispatcher.handleAction({
    actionType: HANDLE_MODAL_STATE,
    state,
  });
}

export function setBanlistModal(state, banlist = []) {
  trackEvent('Banlist', state ? 'open modal' : 'close modal');
  ModalDispatcher.handleAction({
    actionType: BANLIST_MODAL_STATE,
    state,
    banlist,
  });
}

export function setInfoModal(state) {
  ModalDispatcher.handleAction({
    actionType: INFO_MODAL_STATE,
    state,
  });
}

export function setReportModal(state, targetId) {
  ModalDispatcher.handleAction({
    actionType: REPORT_MODAL_STATE,
    state,
    targetId,
  });
}

export function setMediaSelectionModal(state, deviceList = []) {
  trackEvent('MediaSelect', state ? 'open modal' : 'close modal');
  ModalDispatcher.handleAction({
    actionType: MEDIA_MODAL_STATE,
    state,
    deviceList,
  });
}

export function setMediaSelectionModalType(type) {
  ModalDispatcher.handleAction({
    actionType: MEDIA_MODAL_TYPE,
    type,
  });
}

export function setMediaSelectionModalLoading(loading) {
  ModalDispatcher.handleAction({
    actionType: MEDIA_MODAL_LOADING,
    loading,
  });
}

export function setMediaDeviceId(id, type) {
  if (id) {
    trackEvent('MediaSelect', 'selected media source', type);
  }

  ModalDispatcher.handleAction({
    actionType: MEDIA_MODAL_SET_DEVICE_ID,
    type,
    id,
  });
}

export function setMediaAudioPtt(audioPtt) {
  trackEvent('MediaSelect', 'set PTT', audioPtt ? 'ptt' : 'always on');
  ModalDispatcher.handleAction({
    actionType: MEDIA_MODAL_SET_AUDIO_PTT,
    audioPtt,
  });
}

export function setModalError(error) {
  if (error) {
    trackEvent('Modal Error', error.message ? error.message : error.err);
  }

  ModalDispatcher.handleAction({
    actionType: MODAL_ERROR,
    error,
  });
}

export function setJoinConditionModal(error, body) {
  if (error) {
    trackEvent('Join Condition', error);
  }

  ModalDispatcher.handleAction({
    actionType: SET_JOIN_CONDITION_MODAL,
    error,
    body,
  });
}

export function setProfileModal(open, profile) {
  ModalDispatcher.handleAction({
    actionType: SET_PROFILE_MODAL,
    profile,
    open,
  });
}

export function setIgnoreListModal(open) {
  ModalDispatcher.handleAction({
    actionType: SET_IGNORE_MODAL,
    open,
  });
}

export function setBanModal(open, target) {
  ModalDispatcher.handleAction({
    actionType: SET_BAN_MODAL,
    target,
    open,
  });
}
