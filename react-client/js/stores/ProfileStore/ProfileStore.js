import { EventEmitter } from 'events';
import { ProfileDispatcher } from '../../dispatcher/AppDispatcher';
import * as actionTypes from '../../constants/ActionTypes';

export class ProfileStore extends EventEmitter {
  constructor() {
    super();
    this.state = {
      profile: {},
      loading: false,
      ignoreListItem: null,
    };
  }

  getState() {
    return this.state;
  }

  setProfileData(profile, override = true) {
    if (override) {
      this.state = {
        ...this.state,
        profile,
      };
    } else {
      this.state = {
        ...this.state,
        profile: {
          ...this.state.profile,
          ...profile,
        },
      };
    }
  }

  setLoading(loading) {
    this.state = {
      ...this.state,
      loading,
    };
  }

  setIgnoreListItem(ignoreListItem) {
    this.state = {
      ...this.state,
      ignoreListItem,
    };
  }

  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}

const profileStore = new ProfileStore();

ProfileDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case actionTypes.PROFILE_SET:
      profileStore.setProfileData(action.profile, false);
      break;
    case actionTypes.PROFILE_SET_NEW:
      profileStore.setProfileData(action.profile, true);
      break;
    case actionTypes.PROFILE_LOADING:
      profileStore.setLoading(action.loading);
      break;
    default:
      return true;
  }

  profileStore.emitChange();
  return true;
});

export default profileStore;
