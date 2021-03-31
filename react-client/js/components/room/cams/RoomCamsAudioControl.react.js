import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VideoVolumeControl from '../../elements/VideoVolumeControl.react';

class RoomCamsAudioControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showControl: false,
    };

    this.onChangeVolume = this.onChangeVolume.bind(this);
    this.handleToggleControl = this.handleToggleControl.bind(this);
  }

  onChangeVolume(volume) {
    const { onChange } = this.props;
    onChange(volume);
  }

  handleToggleControl(e, showControl) {
    this.setState({ showControl });
  }

  render() {
    const {
      volume,
    } = this.props;

    const { showControl } = this.state;

    return (
      <VideoVolumeControl
        className="button chat__HeaderOption chat__HeaderOption-streamVolume"
        volume={volume}
        onChange={this.onChangeVolume}
        showControl={showControl}
        onSetControl={this.handleToggleControl}
      />
    );
  }
}

RoomCamsAudioControl.defaultProps = {
  volume: 0,
};

RoomCamsAudioControl.propTypes = {
  onChange: PropTypes.func.isRequired,
  volume: PropTypes.number,
};

export default RoomCamsAudioControl;
