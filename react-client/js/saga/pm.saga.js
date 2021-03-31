import {
  ChatDispatcher,
  PmDispatcher,
} from '../dispatcher/AppDispatcher';
import pmStore from '../stores/PmStore/PmStore';
import * as pmActions from '../actions/PmActions';
import * as chatActions from '../actions/ChatActions';
import * as types from '../constants/ActionTypes';
import { chatTabs } from '../constants/RoomConstants';

function selectTab({ tab }) {
  const { selectedConversation } = pmStore.getState();

  if (!selectedConversation) {
    return;
  }

  if (tab === chatTabs.CHAT_PM) {
    pmActions.setConversationRead(selectedConversation);
  }
}

export default function PmSaga() {
  PmDispatcher.register(({ action }) => {
    const { actionType } = action;

    switch (actionType) {
      default:
        break;
    }
  });

  ChatDispatcher.register(({ action }) => {
    const { actionType } = action;

    switch (actionType) {
      case types.SELECT_CHAT_TAB:
        selectTab(action);
        break;
      default:
        break;
    }
  });
}
