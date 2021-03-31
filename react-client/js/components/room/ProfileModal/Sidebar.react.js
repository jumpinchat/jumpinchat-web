import React from 'react';
import PropTypes from 'prop-types';

const ProfileSidebar = ({ profile }) => (
  <div className="profile__Sidebar">
    <img
      className="profile__Pic"
      src={`https://s3.amazonaws.com/jic-uploads/${profile.pic || 'user-avatar/avatar-blank.png'}`}
      alt={profile.username || profile.handle}
    />
    <div className="profile__Trophies">
      {profile.trophies && profile.trophies.map(trophy => (
        <div
          key={trophy.name}
          className="profile__Trophy"
          title={trophy.title}
        >
          <img
            className="profile__TrophyImage"
            src={trophy.image}
            alt={trophy.title}
          />
        </div>
      ))}
    </div>
  </div>
);

ProfileSidebar.propTypes = {
  profile: PropTypes.shape({
    pic: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    trophies: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })),
  }).isRequired,
};

export default ProfileSidebar;
