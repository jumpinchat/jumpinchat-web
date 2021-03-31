import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Tooltip from '../../elements/Tooltip.react';

const Timestamp = ({ timestamp }) => {
  const timeObj = moment(timestamp);
  const displayTimestamp = timeObj.format('HH:mm');
  const detailTimestamp = timeObj.format('HH:mm:ss');

  return (
    <Tooltip position="left" text={detailTimestamp}>
      <div className="chat__MessageTimestamp">{displayTimestamp}</div>
    </Tooltip>
  );
};

Timestamp.propTypes = {
  timestamp: PropTypes.string.isRequired,
};

export default React.memo(Timestamp);
