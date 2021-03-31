import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  sendOperatorAction,
  ignoreUser,
  unignoreUser,
} from '../../../utils/RoomAPI';
import {
  setReportModal,
  setBanModal,
} from '../../../actions/ModalActions';

import { pmStartConversation } from '../../../actions/PmActions';

class ProfileOptions extends PureComponent {
  constructor() {
    super();
    this.sendOperatorAction = sendOperatorAction;
    this.pmStartConversation = pmStartConversation;
    this.setReportModal = setReportModal;
    this.ignoreUser = ignoreUser;
    this.unignoreUser = unignoreUser;
    this.setBanModal = setBanModal;
    this.callModAction = this.callModAction.bind(this);
    this.handleBan = this.handleBan.bind(this);
    this.handleIgnore = this.handleIgnore.bind(this);
    this.handleReport = this.handleReport.bind(this);
    this.handlePrivateMessage = this.handlePrivateMessage.bind(this);
  }

  getModOptions() {
    let actions = [];

    if (this.getRolePermissions('ban')) {
      actions = [
        ...actions,
        {
          label: 'Ban',
          action: this.handleBan,
        },
      ];
    }

    if (this.getRolePermissions('kick')) {
      actions = [
        ...actions,
        {
          label: 'Kick',
          action: () => this.callModAction('kick'),
        },
      ];
    }

    if (this.getRolePermissions('muteUserChat')) {
      actions = [
        ...actions,
        {
          label: 'Silence',
          action: () => this.callModAction('silence'),
        },
      ];
    }

    return actions;
  }

  getRolePermissions(permission) {
    const {
      roles,
      user: {
        roles: userRoles,
      },
    } = this.props;

    return roles
      .filter(role => userRoles.includes(role.tag))
      .some(role => role.permissions[permission] === true);
  }

  getCanBan() {
    const {
      profile,
      user: {
        isAdmin,
      },
    } = this.props;

    if (this.getRolePermissions('ban')) {
      return (!profile.operatorId || profile.assignedBy) || isAdmin;
    }

    return false;
  }

  handleBan() {
    const {
      profile,
      closeModal,
    } = this.props;
    closeModal();
    this.setBanModal(true, profile.userListId);
  }

  handleIgnore() {
    const {
      ignoreListItem,
      profile,
    } = this.props;

    if (ignoreListItem) {
      return this.unignoreUser(ignoreListItem.id);
    }

    return this.ignoreUser(profile.userListId);
  }

  handleReport() {
    const {
      profile,
      closeModal,
    } = this.props;
    closeModal();
    this.setReportModal(true, profile.userListId);
  }

  handlePrivateMessage() {
    const {
      profile,
      closeModal,
    } = this.props;

    this.pmStartConversation(profile.userListId, profile.userId);
    closeModal();
  }

  callModAction(action) {
    const {
      profile,
      closeModal,
    } = this.props;
    this.sendOperatorAction(action, { user_list_id: profile.userListId });
    closeModal();
  }

  render() {
    const {
      profile,
      ignoreListItem,
      user: {
        user_id: userId,
      },
    } = this.props;

    const modActions = this.getModOptions();

    return (
      <div className="profile__Actions">
        <h3 className="modal__SectionTitle">User actions</h3>
        <button
          type="button"
          className="button button-floating button-outlineBlack profile__Action"
          onClick={this.handleIgnore}
        >
          {ignoreListItem ? 'Unignore' : 'Ignore'}
        </button>

        {userId && (
          <button
            type="button"
            className="button button-floating button-outlineBlack profile__Action"
            onClick={this.handlePrivateMessage}
          >
            Private message
          </button>
        )}


        {profile.username && (
          <a
            href={`/profile/${profile.username}`}
            className="button button-floating button-outlineBlack profile__Action"
            target="_blank"
            rel="noopener noreferrer"
          >
            Full profile
          </a>
        )}

        <button
          type="button"
          className="button button-floating button-red profile__Action"
          onClick={this.handleReport}
        >
          Report user
        </button>

        {modActions.length > 0 && (
          <Fragment>
            <h3 className="modal__SectionTitle">Moderator actions</h3>
            {modActions.map(({ label, action }) => (
              <button
                key={label}
                type="button"
                className="button button-floating button-red profile__Action"
                onClick={action}
              >
                {label}
              </button>
            ))}
          </Fragment>
        )}
      </div>
    );
  }
}

ProfileOptions.defaultProps = {
  ignoreListItem: null,
};

ProfileOptions.propTypes = {
  closeModal: PropTypes.func.isRequired,
  ignoreListItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  profile: PropTypes.shape({
    userListId: PropTypes.string.isRequired,
    userId: PropTypes.string,
    username: PropTypes.string,
    assignedBy: PropTypes.string,
    operatorId: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    isAdmin: PropTypes.bool.isRequired,
    operatorPermissions: PropTypes.objectOf(PropTypes.bool),
    user_id: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  roles: PropTypes.arrayOf(PropTypes.shape({
    tag: PropTypes.string,
    permissions: PropTypes.objectOf(PropTypes.bool),
  })).isRequired,
};

export default ProfileOptions;
