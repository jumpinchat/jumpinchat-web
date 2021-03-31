import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '../elements/Switch.react';
import { setRoomMessageSounds } from '../../actions/ChatActions';
import * as UserApi from '../../utils/UserAPI';
import {
  unsubscribeFromNotifications,
  registerPushNotifications,
} from '../../utils/ServiceWorkerUtils';
import { setNotificationsEnabled } from '../../actions/UserActions';

class SettingsNotifications extends Component {
  constructor() {
    super();
    this.setRoomMessageSounds = setRoomMessageSounds;
    this.handleChangeChatNotifications = this.handleChangeChatNotifications.bind(this);
    this.handleChangePushNotifications = this.handleChangePushNotifications.bind(this);
  }

  handleChangeChatNotifications() {
    const {
      settings: { chatNotificationSounds },
    } = this.props;
    this.setRoomMessageSounds(!chatNotificationSounds);
  }

  handleChangePushNotifications() {
    const { user, settings: { pushNotificationsEnabled } } = this.props;
    if (pushNotificationsEnabled) {
      unsubscribeFromNotifications();
    } else {
      registerPushNotifications();
    }

    setNotificationsEnabled(!pushNotificationsEnabled);
    UserApi.setNotificationsEnabled(user.user_id, !pushNotificationsEnabled);
  }

  render() {
    const { settings } = this.props;
    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Notifications</h2>
        <Switch
          label="Chat notifications"
          checked={settings.chatNotificationSounds}
          onChange={this.handleChangeChatNotifications}
          helpText="Chat audio notifications, for public messages, @mentions and private messages"
        />
        <Switch
          label="Push notifications"
          checked={settings.pushNotificationsEnabled}
          onChange={this.handleChangePushNotifications}
          helpText="Enable push notifications, shown if the window is not in focus"
        />
      </div>
    );
  }
}

SettingsNotifications.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.string,
  }).isRequired,
  settings: PropTypes.shape({
    chatNotificationSounds: PropTypes.bool.isRequired,
    pushNotificationsEnabled: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SettingsNotifications;
