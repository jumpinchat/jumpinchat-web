import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-rangeslider';

const VolumeControl = forwardRef(({ volume, onChangeVolume }, ref) => (
  <div
    className="cams__VolumeSlider"
    onClick={(e) => { e.stopPropagation(); }}
    role="button"
    tabIndex="0"
    ref={ref}
  >
    <Slider
      value={volume}
      format={value => `${value}%`}
      min={0}
      max={100}
      tooltip={false}
      orientation="vertical"
      onChange={onChangeVolume}
    />
  </div>
));

VolumeControl.propTypes = {
  onChangeVolume: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
};

export default VolumeControl;
