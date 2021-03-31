import { EventEmitter } from 'events';

export default class Store extends EventEmitter {
  constructor(name, initialState = {}) {
    super();
    this.name = name;
    this.state = initialState;
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
