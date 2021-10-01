import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  setRoles,
  saveRoles,
  removeRole,
  editRole,
  fetchRoles,
} from '../../actions/RoleActions';
import getRolePermission from '../../utils/getRolePermission';
import ColorPicker from './controls/ColorPicker.react';
import TextInput from './controls/TextInput.react';
import Tooltip from '../elements/Tooltip.react';
import Switch from '../elements/Switch.react';
import IconPicker from './RoomRoles/IconPicker';
import RoleList from './RoomRoles/RoleList';


class SettingsRoomRoles extends Component {
  constructor(props) {
    super();
    const { settings: { roles } } = props;
    this.state = {
      selectedRole: roles[0]._id,
      iconSelectOpen: false,
    };

    this.handleSelectRole = this.handleSelectRole.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangePermission = this.handleChangePermission.bind(this);
    this.handleCreateNewRole = this.handleCreateNewRole.bind(this);
    this.handleSaveRoles = this.handleSaveRoles.bind(this);
    this.handleRemoveRole = this.handleRemoveRole.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.handleSetIconPicker = this.handleSetIconPicker.bind(this);
    this.handleChangeIcon = this.handleChangeIcon.bind(this);
    this.handleSortRoles = this.handleSortRoles.bind(this);
  }

  componentWillUnmount() {
    fetchRoles();
  }

  handleSelectRole(selectedRole) {
    this.setState({ selectedRole });
  }

  handleChange(id, property, value) {
    const { settings: { roles } } = this.props;

    editRole({
      ...roles.find(r => r._id === id),
      [property]: value,
      unsaved: true,
    });
  }

  handleCreateNewRole() {
    const { settings: { roles } } = this.props;
    const roleTags = roles.map(r => r.tag);
    let newRoleId = 1;

    while (roleTags.includes(`new_role${newRoleId}`)) {
      newRoleId += 1;
    }

    const newRole = {
      _id: `new_role${newRoleId}`,
      name: `new role ${newRoleId}`,
      tag: `new_role${newRoleId}`,
      icon: {
        color: null,
      },
      permissions: {},
      unsaved: true,
      new: true,
    };

    const updatedRoles = [
      newRole,
      ...roles,
    ];

    setRoles(updatedRoles);
    this.setState({ selectedRole: newRole._id });
  }

  handleChangePermission(id, permission) {
    const { settings: { roles } } = this.props;

    const role = roles.find(r => r._id === id);
    const updatedRole = {
      ...role,
      permissions: {
        ...role.permissions,
        [permission]: !role.permissions[permission],
      },
      unsaved: true,
    };

    editRole(updatedRole);
  }

  handleSaveRoles() {
    const { settings: { roles } } = this.props;
    saveRoles(roles);
  }

  handleRemoveRole(roleId) {
    removeRole(roleId);
  }

  handleChangeColor(color) {
    const { selectedRole } = this.state;
    const { settings: { roles } } = this.props;

    const role = roles.find(r => r._id === selectedRole);
    editRole({
      ...role,
      icon: {
        ...role.icon,
        color,
      },
      unsaved: true,
    });
  }

  handleSetIconPicker(open) {
    this.setState({
      iconSelectOpen: open,
    });
  }

  handleChangeIcon(icon) {
    const { selectedRole } = this.state;
    const { settings: { roles } } = this.props;

    const role = roles.find(r => r._id === selectedRole);
    editRole({
      ...role,
      icon: {
        ...role.icon,
        name: icon,
      },
      unsaved: true,
    });
  }

  handleSortRoles(dragIndex, hoverIndex) {
    const {
      settings: { roles },
    } = this.props;

    const a = hoverIndex > dragIndex ? dragIndex : hoverIndex;
    const b = hoverIndex > dragIndex ? hoverIndex : dragIndex;
    const updatedRoleList = [
      ...roles.slice(0, a),
      { ...roles[b], unsaved: true },
      ...roles.slice(a + 1, b),
      { ...roles[a], unsaved: true },
      ...roles.slice(b + 1),
    ].map((r, index, arr) => ({
      ...r,
      order: arr.length - 1 - index,
    }));

    setRoles(updatedRoleList);
  }

  render() {
    const {
      settings: { roles },
      userRoles,
      isOwner,
      chatColors,
    } = this.props;

    const { selectedRole, iconSelectOpen } = this.state;

    const activeRole = roles.find(r => r._id === selectedRole) || roles[0];
    const hasUnsavedRoles = roles.some(r => r.unsaved);
    const hasNewRoles = roles.some(r => r.new);
    const canAddRole = (
      getRolePermission('manageRoles', roles, userRoles) || isOwner
    )
      && !hasNewRoles;

    return (
      <div className="settings__Page">
        <div className="roles__Wrapper">
          <RoleList
            canAddRole={canAddRole}
            selectedRole={selectedRole}
            roles={roles}
            onSort={this.handleSortRoles}
            onSelect={this.handleSelectRole}
            onCreate={this.handleCreateNewRole}
          />

          <div className="roles__Form">
            <div className="roles__FormButtonToolbar">
              <button
                className="button button-floating button-red"
                type="button"
                disabled={activeRole.permanent}
                onClick={() => this.handleRemoveRole(activeRole._id)}
              >
                Delete role
              </button>
              <button
                className="button button-floating button-blue"
                type="button"
                disabled={!hasUnsavedRoles}
                onClick={this.handleSaveRoles}
              >
                Save changes
              </button>
            </div>
            <TextInput
              value={activeRole.name}
              onChange={e => this.handleChange(activeRole._id, 'name', e.target.value)}
              label="Role name"
              id="rolename"
            />
            <TextInput
              value={activeRole.tag}
              onChange={e => this.handleChange(activeRole._id, 'tag', e.target.value)}
              label="Tag"
              id="roletag"
              subTitle="used to @mention users in this role"
            />

            {activeRole.icon && !activeRole.isDefault && (
              <div className="roles__ColorPicker">
                <ColorPicker
                  colors={chatColors}
                  activeColor={activeRole.icon.color}
                  onChange={this.handleChangeColor}
                />
                <IconPicker
                  onOpen={() => this.handleSetIconPicker(true)}
                  onClose={() => this.handleSetIconPicker(false)}
                  onChange={this.handleChangeIcon}
                  isOpen={iconSelectOpen}
                  value={activeRole.icon.name}
                  icons={[
                    'star',
                    'star-half-alt',
                    'shield-alt',
                    'tag',
                    'circle',
                    'certificate',
                  ]}
                />
              </div>


            )}

            <div className="roles__Permissions">
              <div className="roles__PermissionGroup">
                <h3 className="settings__Title">General permissions</h3>
                <Switch
                  label="Broadcast"
                  checked={activeRole.permissions.broadcast}
                  onChange={() => this.handleChangePermission(activeRole._id, 'broadcast')}
                  helpText=""
                />
                <Switch
                  label="Bypass room password"
                  checked={activeRole.permissions.bypassPassword}
                  onChange={() => this.handleChangePermission(activeRole._id, 'bypassPassword')}
                  helpText=""
                />
              </div>
              <div className="roles__PermissionGroup">
                <h3 className="settings__Title">Media permissions</h3>
                <Switch
                  label="Play media"
                  checked={activeRole.permissions.playMedia}
                  onChange={() => this.handleChangePermission(activeRole._id, 'playMedia')}
                  helpText=""
                />
                <Switch
                  label="Control media"
                  checked={activeRole.permissions.controlMedia}
                  onChange={() => this.handleChangePermission(activeRole._id, 'controlMedia')}
                  helpText="Play, pause and seek videos"
                />
              </div>

              <div className="roles__PermissionGroup">
                <h3 className="settings__Title">Moderation permissions</h3>
                <Switch
                  label="Kick users"
                  checked={activeRole.permissions.kick}
                  onChange={() => this.handleChangePermission(activeRole._id, 'kick')}
                  helpText="Boot users from the room. They can rejoin."
                />
                <Switch
                  label="Ban users"
                  checked={activeRole.permissions.ban}
                  onChange={() => this.handleChangePermission(activeRole._id, 'ban')}
                  helpText=""
                />
                <Switch
                  label="Close broadcasts"
                  checked={activeRole.permissions.closeCam}
                  onChange={() => this.handleChangePermission(activeRole._id, 'closeCam')}
                  helpText=""
                />
                <Switch
                  label="Silence users"
                  checked={activeRole.permissions.muteUserChat}
                  onChange={() => this.handleChangePermission(activeRole._id, 'muteUserChat')}
                  helpText=""
                />
              </div>

              <div className="roles__PermissionGroup">
                <h3 className="settings__Title">Room management permissions</h3>
                <Switch
                  label="Room details"
                  checked={activeRole.permissions.roomDetails}
                  onChange={() => this.handleChangePermission(activeRole._id, 'roomDetails')}
                  helpText="Update room topic"
                />
                <Switch
                  label="Upload emoji"
                  checked={activeRole.permissions.uploadEmoji}
                  onChange={() => this.handleChangePermission(activeRole._id, 'uploadEmoji')}
                  helpText="Upload and update custom room emoji"
                />
                <Switch
                  label="Assign roles"
                  checked={activeRole.permissions.assignRoles}
                  onChange={() => this.handleChangePermission(activeRole._id, 'assignRoles')}
                  helpText=""
                />
                <Switch
                  label="Manage roles"
                  checked={activeRole.permissions.manageRoles}
                  onChange={() => this.handleChangePermission(activeRole._id, 'manageRoles')}
                  helpText="Create, update and remove roles"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SettingsRoomRoles.propTypes = {
  settings: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      isDefault: PropTypes.bool,
      permissions: PropTypes.objectOf(PropTypes.bool).isRequired,
      icon: PropTypes.shape({
        color: PropTypes.string,
        name: PropTypes.string,
      }),
    })).isRequired,
  }).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOwner: PropTypes.bool.isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SettingsRoomRoles;
