import { SessionDispatcher } from '../dispatcher/AppDispatcher';
import {
  SESSION_ID_SAVE,
  SESSION_IS_RECONNECTING,
} from '../constants/ActionTypes';

export function setSessionId(id) {
  SessionDispatcher.handleAction({
    actionType: SESSION_ID_SAVE,
    id,
  });
}

export function setIsReconnecting(isReconnecting) {
  SessionDispatcher.handleAction({
    actionType: SESSION_IS_RECONNECTING,
    isReconnecting,
  });
}

export default null;
