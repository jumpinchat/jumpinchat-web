import { PushDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';

export function setManager(manager) {
  PushDispatcher.handleAction({
    actionType: types.PUSH_SET_MANAGER,
    manager,
  });
}

export function setPublicKey(publicKey) {
  PushDispatcher.handleAction({
    actionType: types.PUSH_SET_PUBLIC_KEY,
    publicKey,
  });
}
