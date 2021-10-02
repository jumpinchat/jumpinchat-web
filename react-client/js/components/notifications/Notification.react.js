/**
 * Created by vivaldi on 14/04/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NotificationWrapper from './NotificationWrapper.react';

import {
  pauseNotification,
  resumeNotifiation,
  closeNotification,
} from '../../actions/NotificationActions';

class Notification extends Component {
  constructor(props) {
    super(props);

    this.pause = this.pause.bind(this);
    this.close = this.close.bind(this);
    this.resume = this.resume.bind(this);
    this.closeByButton = this.closeByButton.bind(this);
  }

  pause() {
    pauseNotification();
  }

  resume() {
    resumeNotifiation();
  }

  close() {
    if (this.props.notification.autoClose === false) {
      return;
    }

    closeNotification(this.props.index);
  }

  closeByButton(e) {
    e.stopPropagation();
    e.preventDefault();
    closeNotification(this.props.index);
  }

  render() {
    const { notification } = this.props;
    let closeButton;

    notification.autoClose = notification.autoClose !== false;

    const cx = classnames('banner', {
      'banner-red': notification.color === 'red',
      'banner-blue': notification.color === 'blue',
      'banner-green': notification.color === 'green',
      'banner-yellow': notification.color === 'yellow',
    });

    if (!notification.autoClose) {
      closeButton = (
        <button
          onClick={this.closeByButton}
          className="banner__Close"
          type="button"
        >
          <FontAwesomeIcon icon={['fas', 'times']} />
        </button>
      );
    }

    return (
      <NotificationWrapper
        className={cx}
        action={notification.action}
        onPause={this.pause}
        onResume={this.resume}
        onClose={this.close}
      >
        <span className="banner__Message">
          {notification.action && notification.action.type === 'link' && (
            <i className="banner__Icon fa fa-external-link" aria-hidden="true" />
          )}
          {notification.message}
        </span>
        {closeButton}
      </NotificationWrapper>
    );
  }
}

Notification.propTypes = {
  notification: PropTypes.shape({
    message: PropTypes.string,
    autoClose: PropTypes.bool,
    color: PropTypes.string,
    action: PropTypes.shape({
      type: PropTypes.string,
      payload: PropTypes.string,
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default Notification;
