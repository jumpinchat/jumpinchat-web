import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Tooltip from '../../elements/Tooltip.react';

const RoomUserIcon = ({
  userIcon,
  userId,
  isAdmin,
  isSiteMod,
  isSupporter,
}) => {
  const iconTitle = () => {
    if (!userId) {
      return 'Guest user';
    }

    if (userId && (!isAdmin && !isSiteMod && !isSupporter)) {
      return 'Registered user';
    }

    if (isSupporter && !isAdmin) {
      return 'Site supporter';
    }

    if (isAdmin) {
      return 'Admin, behave yourselves';
    }

    if (isSiteMod) {
      return 'Site moderator';
    }

    return '';
  };

  return (
    <Tooltip text={iconTitle()}>
      <div className="userList__UserIcon">
        {userIcon && (
          <img
            className="userList__UserIconImage"
            src={`https://s3.amazonaws.com/jic-uploads/${userIcon}`}
            alt=""
          />
        )}

        {!userIcon && (
          <i
            className={classnames(
              'userList__UserIconType',
              'fa',
              {
                'userList__UserIconType-guest fa-user-o': !userId,
                'userList__UserIconType-registered fa-user': userId && (!isAdmin && !isSiteMod && !isSupporter),
                'userList__UserIconType-supporter fa-heart': isSupporter && !isAdmin,
                'userList__UserIconType-sitemod fa-user-shield': isSiteMod && !isAdmin,
                'userList__UserIconType-admin fa-user-secret': isAdmin,
              },
            )}
          />
        )}
      </div>
    </Tooltip>
  );
};

RoomUserIcon.defaultProps = {
  userIcon: null,
  userId: null,
};

RoomUserIcon.propTypes = {
  userIcon: PropTypes.string,
  userId: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  isSiteMod: PropTypes.bool.isRequired,
  isSupporter: PropTypes.bool.isRequired,
};

export default RoomUserIcon;
