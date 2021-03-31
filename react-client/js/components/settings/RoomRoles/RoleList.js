import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../../elements/Tooltip.react';
import SortItem from '../../elements/Sortable/SortItem';
import SortContainer from '../../elements/Sortable/SortContainer';

const RoleList = ({
  roles,
  selectedRole,
  canAddRole,
  onSort,
  onSelect,
  onCreate,
}) => (
  <div className="roles__ListWrapper">
    <h3 className="settings__Title">Roles</h3>
    <ul className="roles__List">
      {canAddRole && (
        <li className="roles__ListItem">
          <button
            type="button"
            className={
              classNames(
                'settings__MenuItemButton',
                'settings__MenuItemButton--clear',
              )
            }
            onClick={onCreate}
          >
            <FontAwesomeIcon icon={['fas', 'plus']} /> Add new role
          </button>
        </li>
      )}
      <SortContainer>
        {roles.map((role, index) => (
          <SortItem
            key={role._id}
            id={role._id}
            index={index}
            type="role"
            onMove={onSort}
          >
            <li key={role._id} className="roles__ListItem">
              <button
                type="button"
                className={classNames('settings__MenuItemButton', 'roles__ListItemButton', {
                  'settings__MenuItemButton--current': selectedRole === role._id,
                })}
                onClick={() => onSelect(role._id)}
              >
                <div className="roles__ListItemBody">
                  {role.permanent && (
                    <Fragment>
                      <Tooltip text="Role is permanent and can not be deleted" position="bottom">
                        <span className="roles__ListItemIcon">
                          <FontAwesomeIcon icon={['fas', 'lock']} />
                        </span>
                      </Tooltip>
                      {' '}
                    </Fragment>
                  )}
                  {role.name}
                </div>

                <FontAwesomeIcon icon={['fas', 'grip-vertical']} className="roles__ListItemIcon" />
              </button>
            </li>
          </SortItem>
        ))}
      </SortContainer>
    </ul>
  </div>
);

RoleList.propTypes = {
  canAddRole: PropTypes.bool.isRequired,
  selectedRole: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
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
};

export default RoleList;
