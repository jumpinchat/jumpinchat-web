import React from 'react';
import PropTypes from 'prop-types';
import YoutubeAudioControls from './YoutubeAudioControls.react';
import YoutubePlayPause from './YoutubePlayPause.react';
import YoutubeProgress from './YoutubeProgress.react';

const YoutubeControls = ({
  duration,
  currentTime,
  onPlayPause,
  volume,
  showVolume,
  onSetControl,
  onChangeVolume,
  paused,
  userIsOperator,
}) => (
  <div className="youtube__Controls">
    <YoutubePlayPause
      paused={!!paused}
      onTogglePlay={onPlayPause}
      disabled={!userIsOperator}
    />
    <YoutubeProgress
      duration={duration}
      currentTime={currentTime}
    />
    <YoutubeAudioControls
      volume={volume}
      showVolume={showVolume}
      onSetControl={onSetControl}
      onChangeVolume={onChangeVolume}
    />
  </div>
);

YoutubeControls.propTypes = {
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
  showVolume: PropTypes.bool.isRequired,
  onSetControl: PropTypes.func.isRequired,
  onChangeVolume: PropTypes.func.isRequired,
  paused: PropTypes.bool.isRequired,
  userIsOperator: PropTypes.bool.isRequired,
};

export default YoutubeControls;
