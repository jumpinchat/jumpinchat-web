/* global navigator, Janus */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { publish } from '../../utils/CamUtil';
import { setModalError } from '../../actions/ModalActions';
import {
  defaultVideoConstraints,
  getVideoConstraints,
} from '../../constants/MediaConstants';

const MediaSourceError = ({ error }) => console.log({ error }) || (
  <div
    className="mediaSources__Source mediaSources__Source-error"
  >
    <FontAwesomeIcon
      icon={['fas', 'exclamation-circle']}
    />
    <span className="mediaSources__SourceErrorMessage">
      {error}
    </span>
  </div>
);

class MediaSource extends Component {
  static destroyStream(stream) {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.stop();
      console.log('stop track', { track });
    });
  }

  constructor(props) {
    super(props);
    this.publish = publish;
    this.setModalError = setModalError;
    this.onSelectDevice = this.onSelectDevice.bind(this);
    this.state = {
      error: null,
    };
  }

  async componentDidMount() {
    // substitue for setTimeout, since this
    // needs a return value as a promise for
    // testing reasons.
    this.streamPromise = this.getUserMedia();
    return Promise.resolve();
  }

  componentDidUpdate(prevProps) {
    const { videoQuality } = this.props;
    const { videoQuality: prevVideoQuality } = prevProps;

    if (videoQuality && videoQuality.id !== prevVideoQuality.id) {
      this.streamPromise = this.getUserMedia();
    }
  }

  async componentWillUnmount() {
    let { stream } = this;
    if (this.streamPromise) {
      stream = await this.streamPromise;
    }

    if (stream) {
      stream.getAudioTracks().forEach(track => track.stop());
      stream.getVideoTracks().forEach(track => track.stop());
    }
  }

  onSelectDevice() {
    this.props.onSelectDevice(this.props.device.deviceId, this.props.type);
  }

  getUserMedia() {
    const {
      isGold,
      videoQuality,
      type,
      device,
    } = this.props;

    if (type !== 'video' || !this.video) {
      return null;
    }

    const constraints = isGold
      ? getVideoConstraints(videoQuality)
      : defaultVideoConstraints;


    return navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          deviceId: {
            exact: device.deviceId,
          },
          ...constraints,
        },
      })
      .then((stream) => {
        console.info(stream, 'stream');
        this.stream = stream;
        if (this.video) {
          this.video.srcObject = stream;
        }
        return stream;
      })
      .catch((error) => {
        if (error.name === 'ConstraintNotSatisfiedError') {
          // maybe do nothing here, just not show source
          console.error({ error }, 'constraints not satisfied');
        } else if (error.name === 'PermissionDeniedError') {
          this.setModalError({
            message: 'You don\'t have permission to use one or more video sources',
          });
        } else {
          console.error({ error }, 'getUserMedia error');
        }

        this.setState({
          error: error.message,
        });
      });
  }


  render() {
    const { error } = this.state;
    const { device, type } = this.props;

    if (error) {
      return (
        <div className="mediaSources__SourceWrapper mediaSources__SourceWrapper-error">
          {error && (
            <MediaSourceError error={error} />
          )}
          <span className="mediaSources__SourceLabel">{device.label}</span>
        </div>
      );
    }
    return (
      <button
        type="button"
        className="mediaSources__SourceWrapper"
        title={device.label}
        onClick={this.onSelectDevice}
      >
        {type === 'video' && !device.deviceId && (
          <div
            className="mediaSources__Source mediaSources__Source-audio"
          >
            <i className="fa fa-microphone" aria-hidden="true" />
          </div>
        )}

        {type === 'video' && device.deviceId && (
          <video
            className="mediaSources__Source"
            ref={(e) => { this.video = e; }}
            autoPlay
            playsInline
          />
        )}

        {type === 'audio' && (
          <div
            className="mediaSources__Source mediaSources__Source-audio"
          >
            <i className="fa fa-microphone" aria-hidden="true" />
          </div>
        )}

        {type === 'screen' && (
          <div
            className="mediaSources__Source mediaSources__Source-screen"
          >
            <i className="fa fa-television" aria-hidden="true" />
          </div>
        )}
        <span className="mediaSources__SourceLabel">{device.label}</span>
      </button>
    );
  }
}

MediaSource.defaultProps = {
  device: null,
  isGold: false,
  videoQuality: null,
};

MediaSource.propTypes = {
  device: PropTypes.object,
  onSelectDevice: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  isGold: PropTypes.bool,
  videoQuality: PropTypes.shape({
    label: PropTypes.string,
    id: PropTypes.string,
    dimensions: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
    frameRate: PropTypes.number,
  }),
};

export default MediaSource;
