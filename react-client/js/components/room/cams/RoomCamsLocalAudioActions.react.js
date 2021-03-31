/**
 * Created by Zaccary on 05/06/2016.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { trackEvent } from '../../../utils/AnalyticsUtil';
import { setAudioState } from '../../../utils/CamUtil';
import { setLocalAudioActive } from '../../../actions/CamActions';

import AudioVolumeIndicator from '../AudioVolumeIndicator.react';

class RoomCamsLocalAudioActions extends Component {
  constructor(props) {
    super(props);
    this.setAudioState = setAudioState;
    this.setLocalAudioActive = setLocalAudioActive;
    this.enableAudio = this.enableAudio.bind(this);
    this.disableAudio = this.disableAudio.bind(this);
    this.handleToggleAudio = this.handleToggleAudio.bind(this);
    this.audioTimeout = null;
  }

  componentDidMount() {
    if (this.props.audioPtt) {
      window.addEventListener('mouseup', this.disableAudio);
    }
  }

  componentWillUnmount() {
    if (this.props.audioPtt) {
      window.removeEventListener('mouseup', this.disableAudio);
    }
  }

  enableAudio() {
    clearTimeout(this.audioTimeout);
    this.setAudioState(true);
    this.setLocalAudioActive(true);
    trackEvent('Cams', 'Audio', 'Push to talk');
  }

  _setAudioDisabled() {
    this.setAudioState(false);
    this.setLocalAudioActive(false);
  }

  disableAudio() {
    clearTimeout(this.audioTimeout);
    this.audioTimeout = setTimeout(this._setAudioDisabled.bind(this), 500);
  }

  handleToggleAudio() {
    const { localAudioActive } = this.props;
    this.setAudioState(!localAudioActive);
    this.setLocalAudioActive(!localAudioActive);
    trackEvent('Cams', 'Audio', localAudioActive ? 'Mute' : 'Unmute');
  }

  render() {
    const {
      localStream,
      audioPtt,
      audioContext,
      localAudioActive,
    } = this.props;

    const cx = classnames(
      'button',
      'button-floating',
      'cams__Action',
      {
        'button-default': !localAudioActive,
        'button-blue': localAudioActive,
      },
    );

    return (
      <div className="cams__LocalAudioActions">
        {localAudioActive && (
          <AudioVolumeIndicator
            audioActive={localAudioActive}
            localStream={localStream}
            audioContext={audioContext}
          />
        )}
        {
          audioPtt && (
            <button
              className={cx}
              onMouseDown={this.enableAudio}
              onTouchStart={this.enableAudio}
              onTouchEnd={this.disableAudio}
              onMouseUp={this.disableAudio}
              onBlur={this.disableAudio}
            >
              <i className="fa fa-microphone" aria-hidden="true" />
              <span className="mobileHidden">
                &nbsp;Push to Talk
              </span>
            </button>
          )
        }
        {
          !audioPtt && (
            <button
              className="button button-default button-floating cams__Action"
              onClick={this.handleToggleAudio}
            >
              <i
                className={classnames('fa', {
                  'fa-microphone': localAudioActive,
                  'fa-microphone-slash': !localAudioActive,
                })}
                aria-hidden="true"
              />
            </button>
          )
        }
      </div>
    );
  }
}

RoomCamsLocalAudioActions.defaultProps = {
  localStream: null,
  audioPtt: true,
  audioContext: null,
};

RoomCamsLocalAudioActions.propTypes = {
  localStream: PropTypes.object,
  audioPtt: PropTypes.bool,
  audioContext: PropTypes.object,
  localAudioActive: PropTypes.bool.isRequired,
};

export default RoomCamsLocalAudioActions;
