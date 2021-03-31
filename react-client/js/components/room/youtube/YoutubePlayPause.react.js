import React from 'react';
import PropTypes from 'prop-types';

const YoutubePlayPause = ({ paused, onTogglePlay, disabled }) => (
  <button
    className="cams__CamControl"
    onClick={() => onTogglePlay(!paused)}
    disabled={disabled}
  >
    {paused && (
      <i className="fa fa-play" />
    )}
    {!paused && (
      <i className="fa fa-pause" />
    )}
  </button>
);

YoutubePlayPause.defaultProps = {
  disabled: false,
};

YoutubePlayPause.propTypes = {
  paused: PropTypes.bool.isRequired,
  onTogglePlay: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default YoutubePlayPause;
