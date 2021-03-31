import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../elements/Tooltip.react';

const RoomRestrictions = ({ restrictions }) => (
  <div className="cams__Restrictions">
    {restrictions.ageRestricted && (
      <Tooltip text="Age restricted room. Only verified users can broadcast" position="bottom">
        <span className="cams__Restriction cams__Restriction--18plus" />
      </Tooltip>
    )}
    {restrictions.forceUser && (
      <Tooltip text="Only allow registered users" position="bottom">
        <span className="cams__Restriction">
          <FontAwesomeIcon icon={['fas', 'user']} />
        </span>
      </Tooltip>
    )}
    {restrictions.requiresVerfiedEmail && (
      <Tooltip text="Require verified emails" position="bottom">
        <span className="cams__Restriction">
          <FontAwesomeIcon icon={['fas', 'envelope']} />
        </span>
      </Tooltip>
    )}
    {restrictions.requiresPassword && (
      <Tooltip text="Room is password protected" position="bottom">
        <span className="cams__Restriction">
          <FontAwesomeIcon icon={['fas', 'lock']} />
        </span>
      </Tooltip>
    )}
    {!restrictions.public && (
      <Tooltip
        text="Room is hidden from public room directory"
        position="bottom"
      >
        <span className="cams__Restriction">
          <FontAwesomeIcon icon={['far', 'eye-slash']} />
        </span>
      </Tooltip>
    )}
  </div>
);

RoomRestrictions.propTypes = {
  restrictions: PropTypes.objectOf(PropTypes.bool).isRequired,
};

export default RoomRestrictions;
