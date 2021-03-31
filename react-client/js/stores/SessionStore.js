
import { EventEmitter } from 'events';
import { SessionDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';

class SessionStore extends EventEmitter {
  constructor(props) {
    super(props);

    this.state = {
      id: null,
      isReconnecting: false,
    };
  }

  getState() {
    return this.state;
  }

  setSessionId(id) {
    this.state = {
      ...this.state,
      id,
    };
  }

  setIsReconnecting(isReconnecting) {
    this.state = {
      ...this.state,
      isReconnecting,
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

const sessionStore = new SessionStore();

SessionDispatcher.register((payload) => {
  const { action } = payload;
  switch (action.actionType) {
    case types.SESSION_ID_SAVE:
      sessionStore.setSessionId(action.id);
      break;
    case types.SESSION_IS_RECONNECTING:
      sessionStore.setIsReconnecting(action.isReconnecting);
      break;
    default:
      return true;
  }

  sessionStore.emitChange();

  return true;
});

export default sessionStore;
