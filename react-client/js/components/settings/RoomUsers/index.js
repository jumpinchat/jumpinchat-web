import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getRoomEnrollments,
  addRoomUserEnrollment,
  enrollUser,
  unenrollUser,
} from '../../../actions/RoleActions';
import RoomUsersListItem from './ListItem';
import TextInput from '../controls/TextInput.react';
import SelectInput from '../controls/SelectInput';

class SettingsRoomUsers extends Component {
  constructor(props) {
    super();

    const {
      settings: {
        roles,
      },
    } = props;

    const defaultRole = roles.find(r => r.isDefault);

    this.state = {
      roleDropdownOpen: null,
      search: '',
      filter: defaultRole && defaultRole.tag,
      userAddError: null,
    };

    this.addRoomUserEnrollment = addRoomUserEnrollment;
    this.enrollUser = enrollUser;
    this.unenrollUser = unenrollUser;

    this.handleAddUser = this.handleAddUser.bind(this);
    this.handleOpenDropdown = this.handleOpenDropdown.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleChangeFilter = this.handleChangeFilter.bind(this);
    this.handleUserAddInputChange = this.handleUserAddInputChange.bind(this);
  }

  componentDidMount() {
    getRoomEnrollments();
  }

  handleAddUser(e) {
    e.preventDefault();
    const username = this.newUser.value;
    this.addRoomUserEnrollment(username);
  }

  handleOpenDropdown(username) {
    this.setState({
      roleDropdownOpen: username,
    });
  }

  handleEnrollUser(roleId, userId) {
    this.enrollUser(roleId, userId);
    this.handleOpenDropdown(null);
  }

  handleUnenrollUser(enrollmentId) {
    this.unenrollUser(enrollmentId);
    this.handleOpenDropdown(null);
  }

  handleChangeSearch(e) {
    this.setState({
      search: e.target.value,
    });
  }

  handleChangeFilter(e) {
    this.setState({
      filter: e.target.value,
    });
  }

  handleUserAddInputChange(e) {
    const {
      settings: {
        enrollments,
      },
    } = this.props;

    const { value } = e.target;
    const userExists = enrollments.some(({ username }) => username === value);

    if (userExists) {
      return this.setState({
        userAddError: 'User already added',
      });
    }

    return this.setState({
      userAddError: null,
    });
  }

  render() {
    const {
      settings: {
        roles,
        enrollments,
      },
      userAddError: userAddRequestError,
    } = this.props;

    const {
      roleDropdownOpen,
      search,
      filter,
      userAddError,
    } = this.state;

    return (
      <div className="settings__Page">
        <div className="roomUserSettings__Filters">
          <TextInput
            className="roomUserSettings__Filter"
            label="Search users"
            value={search}
            onChange={this.handleChangeSearch}
          />

          <SelectInput
            className="roomUserSettings__Filter"
            label="Filter by roles"
            value={filter}
            options={roles.map(r => ({
              value: r.tag,
              label: r.name,
            }))}
            onChange={this.handleChangeFilter}
          />
        </div>
        <ul className="roomUserSettings__List">
          {!enrollments.some(e => e.new) && (
            <li className="roomUserSettings__ListItem">
              <TextInput
                label="Add user by username"
                onSubmit={this.handleAddUser}
                onChange={this.handleUserAddInputChange}
                ref={(e) => { this.newUser = e; }}
                buttonLabel={<FontAwesomeIcon icon={['fas', 'plus']} />}
                disabled={userAddError}
                error={userAddError || userAddRequestError}
              />
            </li>
          )}
          {
            enrollments
              .filter((enrollment) => {
                if (search && search.trim() !== '') {
                  const re = new RegExp(search);
                  return re.test(enrollment.username);
                }

                return true;
              })
              .filter(enrollment => enrollment.new || enrollment.roles.some(r => r.tag === filter))
              .map(e => (
                <RoomUsersListItem
                  enrollment={e}
                  roles={roles.filter(r => !r.isDefault)}
                  key={e.username}
                  dropdownOpen={roleDropdownOpen === e.username}
                  onSetDropdown={username => this.handleOpenDropdown(username)}
                  onAddRole={roleId => this.handleEnrollUser(roleId, e.userId)}
                  onRemoveRole={enrollmentId => this.handleUnenrollUser(enrollmentId)}
                />
              ))
          }
        </ul>
      </div>
    );
  }
}

SettingsRoomUsers.defaultProps = {
  userAddError: null,
};

SettingsRoomUsers.propTypes = {
  settings: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
    })).isRequired,
    enrollments: PropTypes.arrayOf(PropTypes.shape({
      username: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      roles: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        roleId: PropTypes.string.isRequired,
        enrollmentId: PropTypes.string.isRequired,
        tag: PropTypes.string.isRequired,
      })).isRequired,
    })).isRequired,
  }).isRequired,
  userAddError: PropTypes.string,
};

export default SettingsRoomUsers;
