import { ApplicationDispatcher } from '../dispatcher/AppDispatcher';
import * as actionTypes from '../constants/ActionTypes';

export function setLayout(layout, save = true) {
  ApplicationDispatcher.handleAction({
    actionType: actionTypes.SET_LAYOUT,
    layout,
    save,
  });
}

export function setSettingsModal(open) {
  ApplicationDispatcher.handleAction({
    actionType: actionTypes.SET_SETTINGS_MODAL,
    open,
  });
}

export function setSettingsError(error) {
  ApplicationDispatcher.handleAction({
    actionType: actionTypes.SET_SETTINGS_ERROR,
    error,
  });
}

export default null;
