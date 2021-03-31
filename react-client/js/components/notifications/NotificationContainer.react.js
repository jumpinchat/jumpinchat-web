/**
 * Created by vivaldi on 14/04/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NotificationStore from '../../stores/NotificationStore';
import Notification from './Notification.react';

class NotificationContainer extends Component {
  constructor() {
    super();
    this.state = this.getStateFromStore();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    NotificationStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    NotificationStore.removeChangeListener(this._onChange);
  }

  getStateFromStore() {
    return {
      notifications: NotificationStore.getNotifications(),
    };
  }

  _onChange() {
    this.setState(this.getStateFromStore());
  }

  render() {
    if (this.state.notifications.length) {
      return (
        <div className="notifications__Container banner__Container">

          {this.state.notifications.map((notification, index) => (
            <Notification
              notification={notification}
              key={notification.id}
              index={index}
            />
          ))}

        </div>
      );
    }

    return null;
  }
}

export default NotificationContainer;
