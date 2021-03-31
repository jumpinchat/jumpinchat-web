import { EventEmitter } from 'events';
import { PushDispatcher } from '../dispatcher/AppDispatcher';
import {
  PUSH_SET_MANAGER,
  PUSH_SET_PUBLIC_KEY,
} from '../constants/ActionTypes';

class PushStore extends EventEmitter {
  constructor(props) {
    super(props);

    this.state = {
      manager: null,
      publicKey: null,
    };
  }

  setManager(manager) {
    this.state = {
      ...this.state,
      manager,
    };
  }

  setPublicKey(publicKey) {
    this.state = {
      ...this.state,
      publicKey,
    };
  }

  getState() {
    return this.state;
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

const pushStore = new PushStore();

PushDispatcher.register((payload) => {
  const { action } = payload;
  switch (action.actionType) {
    case PUSH_SET_MANAGER:
      pushStore.setManager(action.manager);
      break;
    case PUSH_SET_PUBLIC_KEY:
      pushStore.setPublicKey(action.publicKey);
      break;
    default:
      return true;
  }

  pushStore.emitChange();

  return true;
});

export default pushStore;
