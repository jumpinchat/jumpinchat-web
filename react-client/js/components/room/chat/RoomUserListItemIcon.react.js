import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../../elements/Tooltip.react';

const RoomUserListItemIcon = ({ roles, userRoles }) => {
  const [topRole] = roles.filter(r => userRoles.includes(r.tag) && !r.isDefault);

  if (!topRole) return null;

  let icon = 'tag';

  if (topRole.icon && topRole.icon.name) {
    icon = topRole.icon.name;
  }

  return (
    <Tooltip text={topRole.name}>
      <div
        className={classNames('userList__UserIcon', 'userList__UserIcon-role', {
          [topRole.icon.color]: topRole.icon.color,
        })}
      >

        <FontAwesomeIcon
          className="userList__UserIconMod"
          icon={['fas', icon]}
        />
      </div>
    </Tooltip>
  );
};

RoomUserListItemIcon.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.shape({
    tag: PropTypes.string.isRequired,
    icon: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
  })).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RoomUserListItemIcon;
