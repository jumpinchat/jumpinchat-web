import React from 'react';
import PropTypes from 'prop-types';
import VideoVolumeControl from '../../elements/VideoVolumeControl.react';

const YoutubeAudioControls = ({
  volume,
  showVolume,
  onSetControl,
  onChangeVolume,
}) => (
  <VideoVolumeControl
    className="button cams__CamControl youtube__Control"
    volume={volume}
    onChange={onChangeVolume}
    onClickOutside={() => onSetControl(false)}
    showControl={showVolume}
    onSetControl={(e, showControl) => {
      e.preventDefault();
      e.stopPropagation();
      onSetControl(showControl);
    }}
  />
);

YoutubeAudioControls.defaultProps = {
  volume: 1,
};

YoutubeAudioControls.propTypes = {
  volume: PropTypes.number,
  showVolume: PropTypes.bool.isRequired,
  onSetControl: PropTypes.func.isRequired,
  onChangeVolume: PropTypes.func.isRequired,
};

export default YoutubeAudioControls;
