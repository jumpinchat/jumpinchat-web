/**
 * Created by vivaldi on 20/09/16.
 */


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VideoVolumeControl from '../../elements/VideoVolumeControl.react';

import {
  toggleMuteRemoteStream,
  setRemoteFeedVolume,
  setFeedVolumeSlider,
} from '../../../actions/CamActions';

class RoomCamAudioActions extends Component {
  constructor(props) {
    super(props);

    this.toggleMuteRemoteStream = toggleMuteRemoteStream;
    this.setFeedVolumeSlider = setFeedVolumeSlider;
    this.setRemoteFeedVolume = setRemoteFeedVolume;
    this.doToggleAudioMuted = this.doToggleAudioMuted.bind(this);
    this.onChangeVolume = this.onChangeVolume.bind(this);
    this.handleHideVolumeControl = this.handleHideVolumeControl.bind(this);
  }

  onChangeVolume(volume) {
    const { feed } = this.props;
    this.setRemoteFeedVolume(feed.remoteFeed.rfid, volume);

    if (feed.volume > 0 && volume === 0) {
      this.toggleMuteRemoteStream(feed.userId);
    } else if (feed.volume === 0 && volume > 0) {
      this.toggleMuteRemoteStream(feed.userId);
    }
  }

  doToggleAudioMuted(e) {
    e.preventDefault();
    e.stopPropagation();
    const { feed } = this.props;
    this.setFeedVolumeSlider(feed.remoteFeed.rfid, !feed.showVolume);
  }

  handleHideVolumeControl() {
    const { feed } = this.props;
    this.setFeedVolumeSlider(feed.remoteFeed.rfid, false);
  }

  render() {
    const {
      isLocalStream,
      feed,
      volume,
    } = this.props;

    if (isLocalStream) {
      return null;
    }

    return (
      <VideoVolumeControl
        className="cams__CamControl cams__CamAudioControls"
        volume={volume}
        onChange={this.onChangeVolume}
        showControl={feed.showVolume}
        onSetControl={(e, showControl) => {
          this.setFeedVolumeSlider(feed.remoteFeed.rfid, showControl);
        }}
      />
    );
  }
}

RoomCamAudioActions.defaultProps = {
  feed: null,
  isLocalStream: false,
  volume: 0,
};

RoomCamAudioActions.propTypes = {
  feed: PropTypes.object,
  isLocalStream: PropTypes.bool,
  volume: PropTypes.number,
};

export default RoomCamAudioActions;
