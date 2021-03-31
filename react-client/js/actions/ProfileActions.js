import { ProfileDispatcher } from '../dispatcher/AppDispatcher';
import { trackEvent } from '../utils/AnalyticsUtil';
import * as actionTypes from '../constants/ActionTypes';

export function setProfile(profile) {
  ProfileDispatcher.handleAction({
    actionType: actionTypes.PROFILE_SET,
    profile,
  });
}

export function setNewProfile(profile) {
  ProfileDispatcher.handleAction({
    actionType: actionTypes.PROFILE_SET_NEW,
    profile,
  });
}

export function setLoading(loading) {
  ProfileDispatcher.handleAction({
    actionType: actionTypes.PROFILE_LOADING,
    loading,
  });
}

export function setIgnoreListItem(ignoreListItem) {
  ProfileDispatcher.handleAction({
    actionType: actionTypes.PROFILE_SET_IGNORE_ITEM,
    ignoreListItem,
  });
}
