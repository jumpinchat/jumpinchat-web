import { EventEmitter } from 'events';
import { RoomDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';

export class RoomStore extends EventEmitter {
  constructor() {
    super();
    this._room = null;
  }

  setRoom(room) {
    this._room = room;
  }

  setRoomSettings(settings) {
    this._room = {
      ...this._room,
      settings: {
        ...this._room.settings,
        ...settings,
      },
    };
  }

  getRoom() {
    return this._room;
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

const roomStore = new RoomStore();

roomStore.dispatchToken = RoomDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.actionType) {
    case types.ROOM_LOAD:
      roomStore.setRoom(action.data);
      break;

    case types.SET_ROOM_SETTINGS:
      roomStore.setRoomSettings(action.settings);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  roomStore.emitChange();

  return true;
});

export default roomStore;
