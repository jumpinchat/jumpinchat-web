import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RequireAccount from './RequireAccount.react';
import RequirePassword from './RequirePassword.react';
import Banned from './Banned.react';
import AgeWarning from './AgeWarning.react';
import Closed from './Closed.react';
import Kicked from './Kicked.react';
import RequireVerifiedEmail from './RequireVerifiedEmail.react';
import MinAge from './MinAge';
import BanReasons from '../../../constants/BanReasons';
import { trackEvent } from '../../../utils/AnalyticsUtil';
import { setJoinConditionModal } from '../../../actions/ModalActions';

class JoinConditionModal extends Component {
  constructor() {
    super();
    this.setJoinConditionModal = setJoinConditionModal;
  }

  dismissModal() {
    this.setJoinConditionModal(false);
    trackEvent('Report', 'Close report modal');
  }

  render() {
    const {
      isOpen,
      room,
      error,
      body,
    } = this.props;

    switch (error) {
      case 'ERR_USER_BANNED':
        return (
          <Banned
            isOpen={isOpen}
            reason={BanReasons[body]}
          />
        );
      case 'ERR_ACCOUNT_REQUIRED':
        return (<RequireAccount isOpen={isOpen} />);
      case 'ERR_AGE_WARNING':
        return (<AgeWarning isOpen={isOpen} />);
      case 'ERR_PASSWORD_REQUIRED':
        return (
          <RequirePassword
            room={room}
            isOpen={isOpen}
          />
        );
      case 'ERR_ROOM_CLOSED':
        return (
          <Closed
            isOpen={isOpen}
            reason={body}
          />
        );
      case 'ERR_KICKED':
        return (
          <Kicked
            isOpen={isOpen}
          />
        );
      case 'ERR_VERIFIED_EMAIL_REQUIRED':
        return (
          <RequireVerifiedEmail isOpen={isOpen} />
        );
      case 'ERR_MIN_ACCOUNT_AGE':
        return (
          <MinAge isOpen={isOpen} min={body} />
        );

      default:
        return null;
    }
  }
}

JoinConditionModal.defaultProps = {
  error: null,
  body: null,
};

JoinConditionModal.propTypes = {
  room: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  error: PropTypes.string,
  body: PropTypes.string,
};

export default JoinConditionModal;
