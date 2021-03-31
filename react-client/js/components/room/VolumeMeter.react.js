import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class VolumeMeter extends Component {
  constructor(props) {
    super(props);
    this._getVolumePercent = this._getVolumePercent.bind(this);
  }

  _getVolumePercent() {
    return Math.round(this.props.volume * 100);
  }

  render() {
    const { volume } = this.props;

    if (volume === null || volume === undefined) {
      return null;
    }

    const style = {
      transform: `scale3d(${volume}, 1, 1)`,
    };

    const cx = classnames('volumeMeter__Fill', {
      'volumeMeter__Fill-low': volume < 0.5,
      'volumeMeter__Fill-med': volume >= 0.5 && volume <= 0.8,
      'volumeMeter__Fill-high': volume > 0.8,
    });

    const title = this._getVolumePercent();

    return (
      <div className="volumeMeter__Container">
        <div className={cx} style={style} title={title} />
      </div>
    );
  }
}

VolumeMeter.defaultProps = {
  volume: 0.0,
};

VolumeMeter.propTypes = {
  volume: PropTypes.number,
};

export default VolumeMeter;
