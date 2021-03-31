import request from 'superagent';
import { ApplicationDispatcher } from '../dispatcher/AppDispatcher';
import * as types from '../constants/ActionTypes';
import { addNotification } from '../actions/NotificationActions';
import { ALERT_COLORS } from '../constants/AlertMap';
import { layouts } from '../constants/RoomConstants';
import UserStore from '../stores/UserStore';

function setLayout({ layout, save }) {
  const { user: { user_id: userId } } = UserStore.getState();

  if (!userId || !save) {
    return null;
  }

  const wideLayout = layout === layouts.HORIZONTAL;
  return request
    .put('/api/user/setLayout', { wideLayout })
    .end((err, response) => {
      if (err) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error saving layout settings',
        });
      }

      if (response.statusCode >= 400) {
        return addNotification({
          color: ALERT_COLORS.ERROR,
          message: 'Error saving layout settings',
        });
      }

      return true;
    });
}

export default function AppSaga() {
  ApplicationDispatcher.register(({ action }) => {
    const { actionType } = action;

    switch (actionType) {
      case types.SET_LAYOUT:
        return setLayout(action);
      default:
        break;
    }
  });
}
