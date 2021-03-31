import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import TetherComponent from 'react-tether';
import { sendOperatorAction } from '../../../utils/RoomAPI';
import WrappedListItems from '../../elements/ListItems.react';
import Tooltip from '../../elements/Tooltip.react';
import RoomChatColorPicker from './RoomChatColorPicker.react';
import ListItemCheckbox from '../../elements/ListItemCheckbox.react';
import { addNotification } from '../../../actions/NotificationActions';
import { trackEvent } from '../../../utils/AnalyticsUtil';
import { setLayout } from '../../../actions/AppActions';
import { layouts } from '../../../constants/RoomConstants';

import {
  setSettingsMenu,
} from '../../../actions/ChatActions';

import {
  setNotificationsEnabled,
  setTheme,
} from '../../../actions/UserActions';

import * as UserApi from '../../../utils/UserAPI';

import {
  setYoutubeSearchModal,
} from '../../../actions/YoutubeActions';

import {
  setPlayYoutubeVideos,
} from '../../../utils/YoutubeAPI';

import {
  unsubscribeFromNotifications,
  registerPushNotifications,
} from '../../../utils/ServiceWorkerUtils';

import { setIgnoreListModal } from '../../../actions/ModalActions';


class RoomChatSettingsMenu extends Component {
  constructor(props) {
    super(props);
    this.sendOperatorAction = sendOperatorAction;
    this.setYoutubeSearchModal = setYoutubeSearchModal;
    this.setPlayYoutubeVideos = setPlayYoutubeVideos;
    this.setSettingsMenu = setSettingsMenu;
    this.setTheme = setTheme;
    this.setIgnoreListModal = setIgnoreListModal;
    this.setLayout = setLayout;

    this.onChangePlayYoutube = this.onChangePlayYoutube.bind(this);
    this.onChangeNotifications = this.onChangeNotifications.bind(this);
    this.closeSettingsMenu = this.closeSettingsMenu.bind(this);
    this.handleOpenYoutubeModal = this.handleOpenYoutubeModal.bind(this);
    this.handleOpenIgnoreListModal = this.handleOpenIgnoreListModal.bind(this);
    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onChangeLayout = this.onChangeLayout.bind(this);
  }

  onChangePlayYoutube() {
    const {
      playYoutubeVideos,
    } = this.props;
    this.setPlayYoutubeVideos(!playYoutubeVideos);
    trackEvent('Youtube', 'set play video option', !playYoutubeVideos);
    addNotification({
      color: 'blue',
      message: !playYoutubeVideos ? 'YouTube videos enabled' : 'YouTube videos disabled',
    });
  }

  onChangeTheme() {
    const {
      darkTheme,
      user,
    } = this.props;

    this.setTheme(!darkTheme);
    if (user.user_id) {
      UserApi.setThemeRequest(user.user_id, !darkTheme);
    }

    trackEvent('Chat', 'set theme', !darkTheme);
    addNotification({
      color: 'blue',
      message: !darkTheme ? 'Dark theme' : 'Light theme',
    });
  }

  onChangeNotifications(e) {
    const { user } = this.props;
    if (!e.target.checked) {
      unsubscribeFromNotifications();
    } else {
      registerPushNotifications();
    }

    setNotificationsEnabled(e.target.checked);
    UserApi.setNotificationsEnabled(user.user_id, e.target.checked);
    addNotification({
      color: 'blue',
      message: e.target.checked
        ? 'Notifications enabled'
        : 'Notifications disabled',
    });
  }

  handleOpenYoutubeModal() {
    this.closeSettingsMenu();
    this.setYoutubeSearchModal(true);
  }

  handleOpenIgnoreListModal() {
    this.closeSettingsMenu();
    this.setIgnoreListModal(true);
  }

  callModAction(action) {
    const { user } = this.props;
    this.sendOperatorAction(action, { user_list_id: user._id });
    this.closeSettingsMenu();
  }

  closeSettingsMenu() {
    this.setSettingsMenu(false);
  }

  onChangeLayout() {
    const { layout } = this.props;
    this.setLayout(layout === layouts.HORIZONTAL ? layouts.VERTICAL : layouts.HORIZONTAL);
  }

  render() {
    const {
      user,
      open,
      onClick,
      chatColors,
      playYoutubeVideos,
      modOnlyPlayMedia,
      darkTheme,
      roomName,
      layout,
    } = this.props;

    let optionsArr = [
      {
        text: 'Room settings',
        element: 'div',
        props: {
          className: 'dropdown__Option dropdown__Option-header',
        },
      },
      {
        element: 'component',
        component: <RoomChatColorPicker
          colors={chatColors}
          activeColor={user.color}
          onSelectColor={onClick}
          className="dropdown__Option"
        />,
      },
      {
        text: 'Open ignore list',
        props: {
          onClick: () => this.handleOpenIgnoreListModal(true),
        },
      },
      {
        element: 'component',
        component: <ListItemCheckbox
          className="dropdown__Option"
          label="Enable YouTube videos"
          checked={playYoutubeVideos}
          onChange={this.onChangePlayYoutube}
        />,
      },
      {
        element: 'component',
        component: <ListItemCheckbox
          className="dropdown__Option"
          label="Enable dark theme"
          checked={darkTheme}
          onChange={this.onChangeTheme}
        />,
      },
      {
        element: 'component',
        component: <ListItemCheckbox
          className="dropdown__Option"
          label="Wide layout"
          checked={layout === layouts.HORIZONTAL}
          onChange={this.onChangeLayout}
        />,
      },
    ];

    if ('settings' in user) {
      optionsArr = [
        ...optionsArr,
        {
          element: 'component',
          component: <ListItemCheckbox
            className="dropdown__Option"
            label="Enable notifications"
            checked={user.settings.pushNotificationsEnabled}
            onChange={this.onChangeNotifications}
          />,
        },
      ];
    }

    const canPlayMedia = modOnlyPlayMedia
      ? !!user.operator_id
      : !!user.user_id;

    if (canPlayMedia) {
      optionsArr = [
        ...optionsArr,
        {
          text: 'Play YouTube video',
          props: {
            onClick: () => this.handleOpenYoutubeModal(),
          },
        },
      ];
    }


    if (user.operatorPermissions) {
      if (user.operatorPermissions.ban) {
        optionsArr = [
          ...optionsArr,
          {
            text: 'Open banlist',
            element: 'button',
            props: {
              onClick: () => this.callModAction('banlist'),
            },
          },
        ];
      }

      optionsArr = [
        ...optionsArr,
        {
          text: 'Room settings',
          element: 'a',
          props: {
            href: `${roomName}/settings/emoji`,
            target: '_blank',
          },
        },
      ];
    }

    return (
      <TetherComponent
        attachment="top center"
        constraints={[{
          to: 'scrollParent',
          attachment: 'together',
        }]}
      >
        <Tooltip text="Chat settings">
          <button
            type="button"
            id="ChatSettings"
            className={classnames('button chat__HeaderOption', {
              'button-blue': open,
            })}
            onClick={onClick}
          >
            <i className="fa fa-gear" />
          </button>
        </Tooltip>
        {open && (
          <WrappedListItems
            options={optionsArr}
            onClickOutside={this.closeSettingsMenu}
          />
        )}
      </TetherComponent>
    );
  }
}

RoomChatSettingsMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    user_id: PropTypes.string,
    operator_id: PropTypes.string,
    color: PropTypes.string.isRequired,
    settings: PropTypes.shape({
      pushNotificationsEnabled: PropTypes.bool.isRequired,
    }).isRequired,
    operatorPermissions: PropTypes.objectOf(PropTypes.bool),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  playYoutubeVideos: PropTypes.bool.isRequired,
  darkTheme: PropTypes.bool.isRequired,
  modOnlyPlayMedia: PropTypes.bool.isRequired,
  roomName: PropTypes.string.isRequired,
  layout: PropTypes.string.isRequired,
};

export default RoomChatSettingsMenu;
