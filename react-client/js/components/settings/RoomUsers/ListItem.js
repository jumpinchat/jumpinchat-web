import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TetherComponent from 'react-tether';
import RoleDropdown from './RoleDropdown';

const RoomUsersListItem = ({
  onSetDropdown,
  onAddRole,
  onRemoveRole,
  enrollment,
  roles,
  dropdownOpen,
}) => (
  <li className="roomUserSettings__ListItem">
    <div className="roomUserSettings__ItemActions">
      <span className="roomUserSettings__ListItemTitle">
        {enrollment.username}
      </span>
      <TetherComponent
        attachment="top center"
        constraints={[
          {
            to: 'window',
            attachment: 'together',
            pin: true,
          },
        ]}
      >
        <button
          className="button button-blue button-floating roomUserSettings__RoleSelectAction"
          type="button"
          onClick={() => onSetDropdown(enrollment.username)}
        >
          {enrollment.roles.length > 0 && (
            <Fragment>
              Roles
              {' '}
              <span className="pill pill--white roomUserSettings__RoleCountPill">
                {enrollment.roles.filter(r => !r.isDefault).length}
              </span>
            </Fragment>
          )}
          {enrollment.roles.length === 0 && (
            <Fragment>
              Assign roles
              &nbsp;
              <FontAwesomeIcon icon={['fas', 'plus']} />
            </Fragment>
          )}
        </button>
        {dropdownOpen && (
          <RoleDropdown
            roles={roles}
            enrollments={enrollment.roles}
            isOpen={dropdownOpen}
            onClose={() => onSetDropdown(null)}
            onAddRole={roleId => onAddRole(roleId)}
            onRemoveRole={enrollmentId => onRemoveRole(enrollmentId)}
          />
        )}
      </TetherComponent>
    </div>
  </li>
);

RoomUsersListItem.propTypes = {
  onSetDropdown: PropTypes.func.isRequired,
  onAddRole: PropTypes.func.isRequired,
  onRemoveRole: PropTypes.func.isRequired,
  enrollment: PropTypes.shape({
    username: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      roleId: PropTypes.string.isRequired,
      enrollmentId: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
  roles: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
  })).isRequired,
  dropdownOpen: PropTypes.bool.isRequired,
};

export default RoomUsersListItem;
