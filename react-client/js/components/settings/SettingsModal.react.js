import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import { setSettingsModal } from '../../actions/AppActions';
import appStore from '../../stores/AppStore';
import chatStore from '../../stores/ChatStore/ChatStore';
import camStore from '../../stores/CamStore/CamStore';
import roomStore from '../../stores/RoomStore';
import userStore from '../../stores/UserStore';
import { withState } from '../../utils/withState';

import SettingsMobileMenuButton from './SettingsMobileMenuButton.react';
import SettingsClose from './SettingsClose.react';
import SettingsMenu from './SettingsMenu.react';
import SettingsAppearance from './SettingsAppearance.react';
import SettingsMedia from './SettingsMedia.react';
import SettingsVideo from './SettingsVideo.react';
import SettingsNotifications from './SettingsNotifications.react';
import SettingsIgnore from './SettingsIgnore.react';
import SettingsBanlist from './SettingsBanlist.react';
import SettingsRoomInfo from './SettingsRoomInfo.react';
import SettingsRoomRoles from './SettingsRoomRoles.react';
import SettingsRoomUsers from './RoomUsers';

class Settings extends Component {
  static getState() {
    return {
      app: appStore.getState(),
      chat: chatStore.getState(),
      user: userStore.getState().user,
      room: roomStore.getRoom(),
      cams: camStore.getState(),
    };
  }

  constructor() {
    super();
    const sections = {
      APPEARANCE: Symbol('appearance'),
      VIDEO: Symbol('Audio and video'),
      MEDIA: Symbol('Media and videos'),
      NOTIFICATIONS: Symbol('Sounds and notifications'),
      IGNORE: Symbol('Ignore list'),

      BANLIST: Symbol('Ban list'),
      ROOM_INFO: Symbol('Room info'),
      ROLES: Symbol('Roles'),
      USERS: Symbol('Users'),
    };
    this.sections = sections;

    this.state = {
      current: sections.APPEARANCE,
      menuOpen: false,
      ...Settings.getState(),
    };

    this.setSettingsModal = setSettingsModal;

    this.handleOpenMenu = this.handleOpenMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChangeSection = this.handleChangeSection.bind(this);
    this.getMenuItems = this.getMenuItems.bind(this);
    this.handleCloseMenu = this.handleCloseMenu.bind(this);
  }

  getHasRolePermission(permission) {
    const {
      userState: { user },
      roleState: {
        roles,
      },
      room: {
        attrs: {
          owner,
        },
      },
    } = this.props;


    if (user.user_id === owner) {
      return true;
    }

    const userRoles = user.roles;
    return roles.some((role) => {
      if (userRoles.includes(role.tag)) {
        return role.permissions[permission];
      }

      return false;
    });
  }

  getMenuItems() {
    const { room } = this.props;

    const items = [
      {
        label: 'App',
        id: 'app',
        items: [
          {
            label: 'Appearance',
            id: this.sections.APPEARANCE,
          },
          {
            label: 'Audio & video',
            id: this.sections.VIDEO,
          },
          {
            label: 'Media',
            id: this.sections.MEDIA,
          },
          {
            label: 'Notifications',
            id: this.sections.NOTIFICATIONS,
          },
        ],
      },
      {

        label: 'User',
        id: 'user',
        items: [
          {
            label: 'Ignore list',
            id: this.sections.IGNORE,
          },
        ],
      },
    ];

    // TODO show settings items more granular, using individual role permissions
    const roomSettings = {
      label: 'Room settings',
      id: 'room',
      items: [],
    };

    if (this.getHasRolePermission('ban')) {
      roomSettings.items.push({
        label: 'Ban list',
        id: this.sections.BANLIST,
      });
    }

    if (room.attrs.owner) {
      if (this.getHasRolePermission('roomDetails')) {
        roomSettings.items.push({
          label: 'Info',
          id: this.sections.ROOM_INFO,
        });
      }


      if (this.getHasRolePermission('manageRoles')) {
        roomSettings.items.push({
          label: 'Roles',
          id: this.sections.ROLES,
        });
      }

      if (this.getHasRolePermission('assignRoles')) {
        roomSettings.items.push({
          label: 'Users',
          id: this.sections.USERS,
        });
      }
    }

    if (roomSettings.items.length > 0) {
      items.push(roomSettings);
    }

    return items;
  }

  handleOpenMenu(e) {
    e.preventDefault();
    const { menuOpen } = this.state;
    this.setState({ menuOpen: !menuOpen });
  }

  handleClose(e) {
    e.preventDefault();
    this.setSettingsModal(false);
  }

  handleChangeSection(section) {
    this.setState({
      current: section,
      menuOpen: false,
    });
  }

  handleCloseMenu() {
    this.setState({
      menuOpen: false,
    });
  }

  render() {
    const {
      current,
      menuOpen,
    } = this.state;

    const {
      isOpen,
      room,
      camState: cams,
      chatState: chat,
      appState: app,
      userState: {
        user,
      },
      roleState: {
        roles,
        enrollments,
        ...roleState
      },
    } = this.props;

    const settings = {
      app: {
        appearance: {
          chatColor: user.color,
          darkTheme: user.settings.darkTheme,
          layout: app.layout,
        },
        video: {
          allFeedsHd: cams.allFeedsHd,
        },
        media: {
          playYoutubeVideos: user.settings.playYtVideos,
        },
        notifications: {
          chatNotificationSounds: chat.sounds,
          pushNotificationsEnabled: user.settings.pushNotificationsEnabled,
        },
      },
      user: {
        ignore: {
          ignoreList: chat.ignoreList,
        },
      },
      room: {
        banlist: {
          banlist: chat.banlist,
        },
        info: {
          topic: room.settings.topic,
        },
        roles: { roles },
        users: {
          enrollments,
          roles,
        },
      },
    };

    return (
      <Modal
        overlayClassName="modal settings"
        className="settings__PopOver"
        isOpen={isOpen}
        contentLabel="Settings"
        onRequestClose={this.handleClose}
      >
        <div className="modal__Body settings__Body">
          <SettingsMobileMenuButton onClick={this.handleOpenMenu} />

          <SettingsClose onClick={this.handleClose} />

          <SettingsMenu
            menuOpen={menuOpen}
            items={this.getMenuItems()}
            current={current}
            onChange={this.handleChangeSection}
            onClose={this.handleCloseMenu}
          />

          {current === this.sections.APPEARANCE && (
            <SettingsAppearance
              settings={settings.app.appearance}
              chatColors={chat.chatColors}
            />
          )}

          {current === this.sections.VIDEO && (
            <SettingsVideo
              settings={settings.app.video}
            />
          )}

          {current === this.sections.MEDIA && (
            <SettingsMedia
              settings={settings.app.media}
            />
          )}

          {current === this.sections.NOTIFICATIONS && (
            <SettingsNotifications
              settings={settings.app.notifications}
              user={user}
            />
          )}

          {current === this.sections.IGNORE && (
            <SettingsIgnore
              settings={settings.user.ignore}
            />
          )}

          {current === this.sections.ROOM_INFO && (
            <SettingsRoomInfo
              settings={settings.room.info}
              errors={app.settingsError.room.info}
              room={room}
            />
          )}
          {current === this.sections.BANLIST && (
            <SettingsBanlist
              settings={settings.room.banlist}
            />
          )}

          {current === this.sections.ROLES && (
            <SettingsRoomRoles
              settings={settings.room.roles}
              userRoles={user.roles}
              isOwner={user.user_id === room.attrs.owner}
              chatColors={chat.chatColors}
            />
          )}

          {current === this.sections.USERS && (
            <SettingsRoomUsers
              userAddError={roleState.userAddError}
              settings={settings.room.users}
              isOwner={user.user_id === room.attrs.owner}
            />
          )}
        </div>
      </Modal>
    );
  }
}

Settings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  room: PropTypes.shape({
    attrs: PropTypes.shape({
      owner: PropTypes.string,
    }),
    settings: PropTypes.shape({
      topic: PropTypes.string,
    }),
  }).isRequired,
  userState: PropTypes.shape({
    user: PropTypes.shape({
      user_id: PropTypes.string.isRequired,
      operator_id: PropTypes.string,
      color: PropTypes.string,
      settings: PropTypes.shape({
        darkTheme: PropTypes.bool,
        playYtVideos: PropTypes.bool,
        pushNotificationsEnabled: PropTypes.bool,
      }).isRequired,
      roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  }).isRequired,
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.object).isRequired,
    enrollments: PropTypes.arrayOf(PropTypes.object).isRequired,
    userAddError: PropTypes.string,
  }).isRequired,
  camState: PropTypes.shape({}).isRequired,
  chatState: PropTypes.shape({}).isRequired,
  appState: PropTypes.shape({}).isRequired,
};

export default withState(Settings);
