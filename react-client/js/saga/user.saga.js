import { UserDispatcher } from '../dispatcher/AppDispatcher';
import { setThemeRequest } from '../utils/UserAPI';
import * as youtubeApi from '../utils/YoutubeAPI';
import userStore from '../stores/UserStore';
import { setLayout } from '../actions/AppActions';
import * as types from '../constants/ActionTypes';
import { layouts } from '../constants/RoomConstants';

function setPlayVideos({ playVideos }) {
  youtubeApi.setPlayYoutubeVideos(playVideos);
}

function setTheme({ darkTheme }) {
  const { user } = userStore.getState();

  if (user.user_id) {
    setThemeRequest(user.user_id, darkTheme);
  }
}

function setUser({ data: user }) {
  const { settings } = user;

  if (!settings) {
    return null;
  }

  const layout = settings.wideLayout
    ? layouts.HORIZONTAL
    : layouts.VERTICAL;

  return setLayout(layout, false);
}

export default function UserSaga() {
  UserDispatcher.register(({ action }) => {
    const { actionType } = action;

    switch (actionType) {
      case types.USER_SET_PLAY_VIDEOS:
        setPlayVideos(action);
        break;
      case types.USER_SET_THEME:
        setTheme(action);
        break;
      case types.USER_LOG_IN:
        setUser(action);
        break;
      default:
        break;
    }
  });
}
