import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import TetherComponent from 'react-tether';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VolumeControl from './VolumeControl/VolumeControl.react';

class VideoVolumeControl extends Component {
  constructor(props) {
    super(props);

    this.hoverTime = 500;
    this.hoverTimeout = null;

    this.toggleMute = this.toggleMute.bind(this);
    this.onChangeVolume = this.onChangeVolume.bind(this);
    this.handleOpenControl = this.handleOpenControl.bind(this);
    this.handleCloseControl = this.handleCloseControl.bind(this);
  }

  onChangeVolume(volume) {
    const { onChange } = this.props;
    onChange(volume);
  }

  toggleMute(e) {
    e.preventDefault();
    e.stopPropagation();
    const { volume, onChange } = this.props;
    const newVolume = volume > 0 ? 0 : 100;
    onChange(newVolume);
  }

  handleOpenControl(e) {
    const { onSetControl } = this.props;
    clearTimeout(this.hoverTimeout);
    onSetControl(e, true);
  }

  handleCloseControl(e) {
    const { onSetControl } = this.props;
    this.hoverTimeout = setTimeout(() => {
      onSetControl(e, false);
    }, this.hoverTime);
  }

  render() {
    const {
      showControl,
      volume,
      onChange,
      className,
    } = this.props;

    return (
      <TetherComponent
        attachment="top center"
        constraints={[{
          to: 'scrollParent',
          attachment: 'together',
        }]}
      >
        <button
          type="button"
          className={className}
          onClick={this.toggleMute}
          onMouseOver={this.handleOpenControl}
          onMouseOut={this.handleCloseControl}
          onFocus={this.handleOpenControl}
          onBlur={this.handleCloseControl}
        >
          {volume > 75 && (
            <FontAwesomeIcon icon={['fas', 'volume-up']} />
          )}

          {volume > 25 && volume <= 75 && (
            <FontAwesomeIcon icon={['fas', 'volume-down']} />
          )}

          {volume > 0 && volume <= 25 && (
            <FontAwesomeIcon icon={['fas', 'volume-down']} />
          )}

          {volume === 0 && (
            <FontAwesomeIcon icon={['fas', 'volume-off']} />
          )}
        </button>

        {showControl && (
          <div
            onMouseOver={this.handleOpenControl}
            onMouseOut={this.handleCloseControl}
            onFocus={this.handleOpenControl}
            onBlur={this.handleCloseControl}
          >
            <VolumeControl
              onChangeVolume={onChange}
              volume={volume}
            />
          </div>
        )}
      </TetherComponent>
    );
  }
}

VideoVolumeControl.defaultProps = {
  volume: 0,
  className: '',
};

VideoVolumeControl.propTypes = {
  showControl: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  volume: PropTypes.number,
  onSetControl: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default VideoVolumeControl;
