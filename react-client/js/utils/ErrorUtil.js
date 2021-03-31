/**
 * Created by Zaccary on 16/07/2016.
 */

import { trackEvent } from './AnalyticsUtil';
import { addNotification } from '../actions/NotificationActions';
import { addMessage } from '../actions/ChatActions';
import { setSettingsError } from '../actions/AppActions';
import {
  setModalError,
  setBanlistModal,
  setJoinConditionModal,
} from '../actions/ModalActions';

export function error(msg) {
  if (msg.err && typeof msg.err !== 'string') {
    return;
  }

  trackEvent('Error', `Client error - ${msg.context}`, msg.message ? msg.message : msg.err);

  switch (msg.context) {
    case 'chat': {
      const statusMsg = {
        ...msg,
        status: true,
        error: true,
      };

      addMessage(statusMsg);
      break;
    }

    case 'modal':
      if (msg.modal.match(/^settings/)) {
        setSettingsError(msg);
      } else {
        setModalError(msg);
      }
      switch (msg.modal) {
        case 'banlist':
          setBanlistModal(true);
          break;
        default:
          break;
      }
      break;

    case 'alert':
    case 'banner': {
      addNotification({
        color: 'red',
        message: msg.message ? msg.message : msg.err,
        autoClose: false,
      });
      break;
    }

    case 'dialog':
      setJoinConditionModal(msg.error, msg.body);
      break;

    default:
      break;
  }
}

export default null;
