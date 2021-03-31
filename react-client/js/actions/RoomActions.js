/**
 * Created by Zaccary on 20/06/2015.
 */

import { RoomDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';

export function getStoredRoom(room) {
  RoomDispatcher.handleAction({
    actionType: types.ROOM_LOAD,
    data: room,
  });
}

export function setRoomSettings(settings) {
  RoomDispatcher.handleAction({
    actionType: types.SET_ROOM_SETTINGS,
    settings,
  });
}

export default null;
