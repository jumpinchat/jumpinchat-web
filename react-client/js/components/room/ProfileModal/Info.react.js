import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const ProfileInfo = ({ profile }) => {
  const name = profile.username || profile.handle;
  const userType = profile.userType || 'guest user';
  return (
    <div className="profile__Info">
      {name} is a <strong>{userType}</strong>
      {profile.joinDate && (
        <Fragment>
          {' '}
          who joined {moment(profile.joinDate).calendar()} and
          was last seen {moment(profile.lastSeen).calendar()}
        </Fragment>
      )}
    </div>
  );
};

ProfileInfo.defaultProps = {
  profile: {},
};

ProfileInfo.propTypes = {
  profile: PropTypes.shape({
    userType: PropTypes.string,
    userId: PropTypes.string,
    handle: PropTypes.string.isRequired,
    username: PropTypes.string,
    joinDate: PropTypes.string,
    lastSeen: PropTypes.string,
  }),
};

export default ProfileInfo;
