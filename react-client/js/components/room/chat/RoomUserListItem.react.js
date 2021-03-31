/**
 * Created by Zaccary on 13/09/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withState } from '../../../utils/withState';
import { setUserListOption } from '../../../actions/ChatActions';
import {
  setHandleModal,
  setProfileModal,
} from '../../../actions/ModalActions';
import {
  setNewProfile,
  setIgnoreListItem,
} from '../../../actions/ProfileActions';
import Tooltip from '../../elements/Tooltip.react';
import RoomUserIcon from './RoomUserIcon.react';
import RoomUserListItemIcon from './RoomUserListItemIcon.react';

export class RoomUserListItem extends Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this.setHandleModal = setHandleModal;
    this.setUserListOption = setUserListOption;
    this.setNewProfile = setNewProfile;
    this.setProfileModal = setProfileModal;
    this.setIgnoreListItem = setIgnoreListItem;
  }

  _handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const {
      clientUser,
      user,
      ignoreListItem,
    } = this.props;

    if (clientUser._id === user._id) {
      this.setHandleModal(true);
    } else {
      this.setNewProfile({
        handle: user.handle,
        userId: user.user_id,
        userListId: user._id,
        assignedBy: user.assignedBy,
        operatorId: user.operator_id,
      });
      this.setIgnoreListItem(ignoreListItem);
      this.setProfileModal(true);
    }
  }

  handleClickOutside() {
    this.setUserListOption(null);
  }

  render() {
    const {
      user,
      roleState: { roles },
      clientUser,
    } = this.props;

    if (!user) return null;

    const {
      _id: id,
      isBroadcasting,
      isAdmin,
      isSiteMod,
      isSupporter,
      user_id: userId,
      userIcon,
      roles: userRoles,
    } = user;

    const broadcastIcon = isBroadcasting
      ? (
        <Tooltip text="User is broadcasting">
          <div className="userList__UserIcon userList__UserIcon-broadcast">
            <i className="fa fa-video-camera" />
          </div>
        </Tooltip>
      )
      : null;

    const currentUser = id === clientUser._id;

    const userHandleCx = classnames(
      'userList__UserHandle',
      {
        'userList__UserHandle-current': currentUser,
      },
    );

    return (
      <div
        className="chat__UserListItem"
        onClick={this._handleClick}
        role="button"
        tabIndex="-1"
        onKeyPress={this._handleClick}
      >
        <RoomUserIcon
          userIcon={userIcon}
          userId={userId}
          isAdmin={isAdmin}
          isSupporter={isSupporter}
          isSiteMod={isSiteMod}
        />

        <div className={userHandleCx}>
          {user.handle}
        </div>

        {broadcastIcon}
        <RoomUserListItemIcon userRoles={userRoles} roles={roles} />
      </div>
    );
  }
}

RoomUserListItem.defaultProps = {
  user: null,
  clientUser: null,
  ignoreListItem: null,
};

RoomUserListItem.propTypes = {
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      icon: PropTypes.shape({
        name: PropTypes.string,
        color: PropTypes.string,
      }),
    })),
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    isBroadcasting: PropTypes.bool,
    isAdmin: PropTypes.bool,
    isSiteMod: PropTypes.bool,
    isSupporter: PropTypes.bool,
    user_id: PropTypes.string,
    userIcon: PropTypes.string,
    handle: PropTypes.string.isRequired,
    assignedBy: PropTypes.string,
    operator_id: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
  clientUser: PropTypes.object,
  ignoreListItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    userListId: PropTypes.string.isRequired,
    userId: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};

export default withState(RoomUserListItem);
