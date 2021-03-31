import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactYoutube from 'react-youtube';
import {
  setYoutubeVideo,
  setYoutubeOptions,
  setYoutubeVolume,
  setYoutubeShowVolume,
} from '../../../actions/YoutubeActions';

import {
  pauseVideo,
  resumeVideo,
  checkVideoPlaying,
  getPlaylist,
} from '../../../utils/YoutubeAPI';
import { withState } from '../../../utils/withState';
import getRolePermission from '../../../utils/getRolePermission';

import { addNotification } from '../../../actions/NotificationActions';
import {
  ERR_YT_DEFAULT,
  ERR_YT_BAD_PARAMS,
  ERR_YT_NO_HTML5,
  ERR_YT_NO_VIDEO,
  ERR_YT_NO_EMBED,
} from '../../../constants/ErrorMessages';

import YoutubeVideoOptions from './YoutubeVideoOptions.react';
import YoutubeControls from './YoutubeControls.react';

export class YoutubeVideoContainer extends Component {
  constructor(props) {
    super(props);

    this.setYoutubeVideo = setYoutubeVideo;
    this.setYoutubeOptions = setYoutubeOptions;
    this.setYoutubeVolume = setYoutubeVolume;
    this.addNotification = addNotification;
    this.pauseVideo = pauseVideo;
    this.resumeVideo = resumeVideo;
    this.checkVideoPlaying = checkVideoPlaying;
    this.getPlaylist = getPlaylist;
    this.setYoutubeShowVolume = setYoutubeShowVolume;
    this.handleVideoReady = this.handleVideoReady.bind(this);
    this.handleVideoDidEnd = this.handleVideoDidEnd.bind(this);
    this.handleVideoHasError = this.handleVideoHasError.bind(this);
    this.handleSetVolume = this.handleSetVolume.bind(this);
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleSyncVideo = this.handleSyncVideo.bind(this);

    this.state = {
      currentTime: 0,
    };
  }

  // TODO deprecate this lifecycle method
  componentWillReceiveProps(nextProps) {
    const {
      videoDetails: {
        pausedAt,
      },
    } = nextProps;

    if (pausedAt === this.props.videoDetails.pausedAt || !this.player) {
      return;
    }

    if (pausedAt) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      hasChangedHandle,
      videoDetails: {
        pausedAt,
        startTime,
        endTime,
      },
    } = this.props;

    if (!prevProps.hasChangedHandle && hasChangedHandle && !pausedAt && this.player) {
      this.player.playVideo();
    }

    const prevStartTime = prevProps.videoDetails.startTime;

    if (prevStartTime && prevStartTime !== startTime && this.player) {
      const startTimestamp = new Date(startTime).getTime();
      const endTimestamp = new Date(endTime).getTime();
      const newCurrentTime = Math.round((endTimestamp - startTimestamp) / 1000);
      this.player.seekTo(newCurrentTime);
    }
  }

  componentWillUnmount() {
    const { onVideoEnd } = this.props;
    onVideoEnd();
    clearInterval(this.videoTimer);
  }

  handleVideoReady(e) {
    const {
      volume,
      videoDetails: {
        pausedAt,
        startAt,
      },
      onVideoReady,
    } = this.props;
    this.player = e.target;
    this.player.setVolume(volume);
    this.player.seekTo(startAt);
    onVideoReady();

    if (pausedAt) {
      this.player.pauseVideo();
    }

    this.videoTimer = setInterval(() => {
      this.setState({
        currentTime: this.player.getCurrentTime(),
      });
    }, 1000);
  }

  handleSetVolume(volume) {
    this.setYoutubeVolume(volume);
    this.player.setVolume(volume);
  }

  handleVideoDidEnd() {
    this.setYoutubeVideo(null);
    this.checkVideoPlaying();
    this.getPlaylist();
  }

  handlePlayPause(paused) {
    if (paused) {
      this.pauseVideo();
    } else {
      this.resumeVideo();
    }
  }

  handleSyncVideo() {
    const { videoDetails } = this.props;
    if (!videoDetails.pausedAt) {
      this.setYoutubeVideo(null);
      this.checkVideoPlaying(false);
    }
  }


  handleVideoHasError(e) {
    switch (e.data) {
      case 2:
        this.addNotification({
          color: 'red',
          message: ERR_YT_BAD_PARAMS,
        });
        break;
      case 5:
        this.addNotification({
          color: 'red',
          message: ERR_YT_NO_HTML5,
        });
        break;
      case 100:
        this.addNotification({
          color: 'red',
          message: ERR_YT_NO_VIDEO,
        });
        break;
      case 101:
      case 150:
        this.addNotification({
          color: 'red',
          message: ERR_YT_NO_EMBED,
        });
        break;
      default:
        this.addNotification({
          color: 'red',
          message: ERR_YT_DEFAULT,
        });
    }

    this.setYoutubeVideo(null);
  }

  render() {
    const {
      videoDetails: {
        mediaId,
        pausedAt,
        duration,
      },
      dimensions,
      optionsOpen,
      volume,
      showVolumeControl,
      userState: { user },
      roleState: { roles },
    } = this.props;

    const {
      currentTime,
    } = this.state;

    const opts = {
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        iv_load_policy: 3,
        rel: 0,
        modestbranding: 1,
      },
    };

    const hasControlPermission = getRolePermission('controlMedia', roles, user.roles);

    return (
      <div
        className="youtube__VideoContainer"
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      >
        <ReactYoutube
          videoId={mediaId}
          opts={opts}
          containerClassName="youtube__VideoWrapper"
          onEnd={this.handleVideoDidEnd}
          onReady={this.handleVideoReady}
          onError={this.handleVideoHasError}
        />
        <div className="cams__CamOverlay youtube__VideoOverlay">
          <YoutubeVideoOptions
            open={mediaId && optionsOpen}
            onSync={this.handleSyncVideo}
          />
          <YoutubeControls
            paused={!!pausedAt}
            onPlayPause={this.handlePlayPause}
            volume={volume}
            showVolume={showVolumeControl}
            onSetControl={setYoutubeShowVolume}
            onChangeVolume={this.handleSetVolume}
            duration={duration}
            currentTime={currentTime}
            userIsOperator={hasControlPermission}
          />
        </div>
      </div>
    );
  }
}

YoutubeVideoContainer.defaultProps = {
  dimensions: null,
  videoDetails: null,
  onVideoReady: () => {},
  optionsOpen: false,
  volume: 100,
  onVideoEnd: () => {},
};

YoutubeVideoContainer.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  videoDetails: PropTypes.shape({
    mediaId: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    pausedAt: PropTypes.string,
    startAt: PropTypes.number.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
  }),
  onVideoReady: PropTypes.func,
  optionsOpen: PropTypes.bool,
  volume: PropTypes.number,
  onVideoEnd: PropTypes.func,
  showVolumeControl: PropTypes.bool.isRequired,
  userIsOperator: PropTypes.bool.isRequired,
  hasChangedHandle: PropTypes.bool.isRequired,
  userState: PropTypes.shape({
    user: PropTypes.shape({
      roles: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      permissions: PropTypes.objectOf(PropTypes.bool),
    })),
  }).isRequired,
};

export default withState(YoutubeVideoContainer);
