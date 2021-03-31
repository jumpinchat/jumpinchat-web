/**
 * Created by Zaccary on 05/06/2016.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import hark from 'hark';
import VolumeMeter from './VolumeMeter.react';

class AudioVolumeIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      volume: 0,
    };
    this.hark = null;
  }

  componentDidMount() {
    const { localStream, audioContext } = this.props;
    const options = {
      interval: 250,
      audioContext,
    };

    this.hark = hark(localStream.stream, options);
    this.hark.on('volume_change', (v) => {
      let volume;
      if (v <= -100) {
        volume = 0;
      } else {
        volume = (v + 100) / 100;
      }

      this.setState({ volume });
    });
  }

  componentWillUnmount() {
    this.hark.stop();
  }

  render() {
    const { volume } = this.state;
    return (
      <div className="cams__AudioVolume">
        <VolumeMeter volume={volume} />
      </div>
    );
  }
}

AudioVolumeIndicator.defaultProps = {
  localStream: null,
  audioContext: null,
};

AudioVolumeIndicator.propTypes = {
  localStream: PropTypes.object,
  audioContext: PropTypes.object,
};

export default AudioVolumeIndicator;
