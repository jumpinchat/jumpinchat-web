/**
 * Created by Zaccary on 23/05/2016.
 */

import { EventEmitter } from 'events';
import { ModalDispatcher } from '../dispatcher/AppDispatcher';
import {
  HANDLE_MODAL_STATE,
  BANLIST_MODAL_STATE,
  MEDIA_MODAL_STATE,
  INFO_MODAL_STATE,
  REPORT_MODAL_STATE,
  MEDIA_MODAL_TYPE,
  MEDIA_MODAL_SET_DEVICE_ID,
  MEDIA_MODAL_LOADING,
  MODAL_ERROR,
  SET_JOIN_CONDITION_MODAL,
  SET_PROFILE_MODAL,
  SET_IGNORE_MODAL,
  SET_BAN_MODAL,
} from '../constants/ActionTypes';

export class ModalStore extends EventEmitter {
  constructor() {
    super();
    this._modalError = null;
    this._handleModal = false;
    this._banlistModal = false;
    this._banlist = [];
    this._infoModal = true;

    this.reportModal = {
      open: false,
      targetId: null,
    };

    this.mediaSelectionModal = {
      open: false,
      loading: false,
      mediaType: 'video',
      deviceList: {
        video: [],
        audio: [],
      },
      selectedDevices: {
        video: null,
        audio: null,
      },
    };

    this.joinConditionModal = {
      error: null,
      body: null,
    };

    this.profileModal = false;

    this.ignoreListModal = {
      open: false,
    };

    this.banModal = {
      target: null,
      open: false,
    };
  }

  setHandleModal(open) {
    this._modalError = null;
    this._handleModal = open;
  }

  setBanlistModal(open) {
    this._modalError = null;
    this._banlistModal = open;
  }

  setBanlist(banlist) {
    this._modalError = null;
    this._banlist = banlist;
  }

  setModalError(error) {
    this._modalError = error;
  }

  setInfoModal(open) {
    this._modalError = null;
    this._infoModal = open;
  }

  setReportModal(open, targetId) {
    this._modalError = null;
    this.reportModal = {
      ...this.reportModal,
      open,
      targetId,
    };
  }

  setDeviceList(devices) {
    this.mediaSelectionModal = {
      ...this.mediaSelectionModal,
      deviceList: {
        video: devices.filter(device => device.kind === 'videoinput'),
        audio: devices.filter(device => device.kind === 'audioinput'),
      },
    };
  }

  setMediaSelectionModal(open) {
    this._modalError = null;
    this.mediaSelectionModal = {
      ...this.mediaSelectionModal,
      open,
    };
  }

  setMediaSelectionLoading(loading) {
    this._modalError = null;
    this.mediaSelectionModal = {
      ...this.mediaSelectionModal,
      loading,
    };
  }

  setMediaSelectionModalType(mediaType) {
    this.mediaSelectionModal = {
      ...this.mediaSelectionModal,
      mediaType,
    };
  }

  setMediaDeviceId(id, type) {
    this.mediaSelectionModal = {
      ...this.mediaSelectionModal,
      selectedDevices: {
        ...this.mediaSelectionModal.selectedDevices,
        [type]: id,
      },
    };
  }

  setJoinCondition(error, body) {
    this.joinConditionModal = {
      ...this.joinConditionModal,
      error,
      body,
    };
  }

  setProfileModal(open) {
    this.profileModal = open;
  }

  setIgnoreListModal(open) {
    this.ignoreListModal = {
      open,
    };
  }

  setBanModal(open, target) {
    this.banModal = {
      open,
      target,
    };
  }

  getInfoModal() {
    return this._infoModal;
  }

  getHandleModal() {
    return this._handleModal;
  }

  getBanlistModal() {
    return this._banlistModal;
  }

  getBanlist() {
    return this._banlist;
  }

  getModalError() {
    return this._modalError;
  }

  getMediaSelectionModal() {
    return this.mediaSelectionModal;
  }

  getReportModal() {
    return this.reportModal;
  }

  getJoinConditionModal() {
    return this.joinConditionModal;
  }

  getProfileModal() {
    return this.profileModal;
  }

  getIgnoreListModal() {
    return this.ignoreListModal;
  }

  getBanModal() {
    return this.banModal;
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

const modalStore = new ModalStore();

ModalDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case HANDLE_MODAL_STATE:
      modalStore.setHandleModal(action.state);
      break;

    case BANLIST_MODAL_STATE:
      modalStore.setBanlistModal(action.state);
      modalStore.setBanlist(action.banlist);
      break;

    case MODAL_ERROR:
      modalStore.setModalError(action.error);
      break;
    case MEDIA_MODAL_STATE:
      modalStore.setMediaSelectionModal(action.state);
      modalStore.setDeviceList(action.deviceList);
      break;

    case INFO_MODAL_STATE:
      modalStore.setInfoModal(action.state);
      break;

    case REPORT_MODAL_STATE:
      modalStore.setReportModal(action.state, action.targetId);
      break;

    case MEDIA_MODAL_TYPE:
      modalStore.setMediaSelectionModalType(action.type);
      break;

    case MEDIA_MODAL_SET_DEVICE_ID:
      modalStore.setMediaDeviceId(action.id, action.type);
      break;

    case MEDIA_MODAL_LOADING:
      modalStore.setMediaSelectionLoading(action.loading);
      break;

    case SET_JOIN_CONDITION_MODAL:
      modalStore.setJoinCondition(action.error, action.body);
      break;

    case SET_PROFILE_MODAL:
      modalStore.setProfileModal(action.open);
      break;

    case SET_IGNORE_MODAL:
      modalStore.setIgnoreListModal(action.open);
      break;

    case SET_BAN_MODAL:
      modalStore.setBanModal(action.open, action.target);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  modalStore.emitChange();

  return true;
});

export default modalStore;
