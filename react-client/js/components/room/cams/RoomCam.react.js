/**
 * Created by Zaccary on 09/09/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import hark from 'hark';
import withErrorBoundary from '../../../utils/withErrorBoundary';
import chatStore from '../../../stores/ChatStore/ChatStore';
import {
  setStreamOptionsState,
  setFeedAudioActive,
} from '../../../actions/CamActions';
import RoomCamAudioActions from './RoomCamAudioActions.react';
import RoomCamOptions from './RoomCamOptions.react';
import Loading from '../../elements/Loading.react';
import { setReportModal } from '../../../actions/ModalActions';

export class RoomCam extends Component {
  constructor(props) {
    super(props);

    this.chatStore = chatStore;
    this.setStreamOptionsState = setStreamOptionsState;
    this.setFeedAudioActive = setFeedAudioActive;
    this.setReportModal = setReportModal;

    this.state = {
      handle: null,
    };

    this._isStreamLocal = this._isStreamLocal.bind(this);
    this._handleClickWrapper = this._handleClickWrapper.bind(this);
    this._getUserId = this._getUserId.bind(this);
    this._getCamUser = this._getCamUser.bind(this);
    this._getHandle = this._getHandle.bind(this);
    this.handleFullscreen = this.handleFullscreen.bind(this);
    this.handleReport = this.handleReport.bind(this);
    this.hark = null;
  }

  componentWillMount() {
    this.setState({
      handle: this.chatStore.getHandleByUserId(this._getUserId(this.props)),
    });
  }

  componentDidMount() {
    const { streamData } = this.props;
    if (streamData && this.stream) {
      this._attachStream();
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      feed,
      streamData,
      dimensions,
      user: {
        hasChangedHandle,
      },
      users,
    } = this.props;

    const { handle } = this.state;

    if (!!streamData && !!handle) {
      const userHandle = this.chatStore.getHandleByUserId(this._getUserId(nextProps));

      if (!dimensions) {
        return true;
      }

      const audioActive = feed.audioActive === nextProps.feed.audioActive;
      const loadingChanged = feed.loading === nextProps.feed.loading;
      const videoEnabled = nextProps.videoEnabled === this.props.videoEnabled;
      const userClosed = nextProps.feed.userClosed === feed.userClosed;
      const token = nextProps.streamData.token === streamData.token;
      const optionsOpen = nextProps.optionsOpen === this.props.optionsOpen;
      const hasUserHandle = userHandle === handle;
      const dimensionsChanged = (
        dimensions.width === nextProps.dimensions.width
        && dimensions.height === nextProps.dimensions.height
      );
      const volumeChanged = feed.volume === nextProps.feed.volume;
      const showVolumeChanged = feed.showVolume === nextProps.feed.showVolume;
      const clientHandleChanged = hasChangedHandle === nextProps.user.hasChangedHandle;
      const userCountChanged = users.length === this.props.users.length;

      // Return false if:
      // the stream token is the same, the options state is the same, and the user handle
      // for the stream is the same, and the dimensions of the stream container is the same
      // Return true in all other cases
      if (videoEnabled
        && token
        && optionsOpen
        && hasUserHandle
        && dimensionsChanged
        && audioActive
        && volumeChanged
        && showVolumeChanged
        && loadingChanged
        && userClosed
        && clientHandleChanged
        && userCountChanged
      ) {
        return false;
      }
    }

    return true;
  }

  // TODO: do this through props or something better than this
  componentWillUpdate(nextProps) {
    const handle = this.chatStore.getHandleByUserId(this._getUserId(nextProps));

    if (handle) {
      this.setState({ handle });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      streamData,
      videoEnabled,
      feed,
      user: {
        hasChangedHandle,
      },
    } = this.props;

    const tokenDiff = streamData.token !== prevProps.streamData.token;
    const videoEnabledDiff = videoEnabled !== prevProps.videoEnabled;
    if (tokenDiff || videoEnabledDiff) {
      this._attachStream();
    }

    if (this.hark && !streamData.stream) {
      this.hark.stop();
      this.hark = null;
    }

    if (!this._isStreamLocal() && streamData.stream) {
      const audioTrack = streamData.stream.getAudioTracks()[0];

      if (!audioTrack) {
        return;
      }

      audioTrack.enabled = feed.volume > 0;
    }

    this.stream.volume = parseFloat(feed.volume / 100) || 0;

    if (!prevProps.hasChangedHandle && hasChangedHandle) {
      this.stream.play()
        .then(() => {})
        .catch((err) => {
          console.error({ err });
        });
    }
  }

  componentWillUnmount() {
    if (this.hark) {
      this.hark.stop();
    }
  }

  initHark() {
    const { streamData, audioContext, feed } = this.props;

    if (!streamData.stream) {
      return;
    }

    const audioTrack = streamData.stream.getAudioTracks()[0];
    if (!streamData.isLocal && streamData.stream && !this.hark && audioTrack) {
      const options = {
        interval: 250,
        audioContext,
      };

      this.hark = hark(streamData.stream, options);
      this.hark.on('volume_change', (volume) => {
        const normalizedVolume = volume + 100;
        const audioActive = normalizedVolume > 30;

        if (audioActive !== feed.audioActive) {
          this.setFeedAudioActive(feed.remoteFeed.rfid, audioActive);
        }
      });
    }
  }

  _attachStream() {
    const { streamData } = this.props;
    const vidElem = this.stream;
    vidElem.srcObject = streamData.stream;
    this.initHark();
  }

  _isStreamLocal() {
    const { streamData } = this.props;
    if (streamData.stream) {
      return !!streamData.isLocal;
    }

    return false;
  }

  _handleClickWrapper() {
    const { streamData } = this.props;
    this.setStreamOptionsState(streamData.token, false);
  }

  _getUserId(props) {
    if (this._isStreamLocal()) {
      return props.user._id;
    }

    return props.streamData.userId;
  }

  _getHandle() {
    const {
      streamData,
      users,
      user: {
        handle,
      },
    } = this.props;
    if (this._isStreamLocal()) {
      return handle;
    }

    return users.find(user => user._id === streamData.userId).handle;
  }

  _getCamUser() {
    const {
      users,
      user,
      streamData,
    } = this.props;

    if (this._isStreamLocal()) {
      return user;
    }

    return users.find(u => u._id === streamData.userId);
  }

  _getCamAudioTracks() {
    const { streamData } = this.props;
    if (streamData.stream) {
      return streamData.stream.getAudioTracks()[0];
    }

    return null;
  }

  handleFullscreen() {
    if (this.stream.requestFullscreen) {
      this.stream.requestFullscreen();
    } else if (this.stream.mozRequestFullScreen) {
      this.stream.mozRequestFullScreen();
    } else if (this.stream.webkitRequestFullscreen) {
      this.stream.webkitRequestFullscreen();
    }
  }

  handleReport() {
    const {
      feed: {
        userId,
      },
    } = this.props;

    this.setReportModal(true, userId);
  }

  render() {
    const {
      streamData,
      feed,
      videoEnabled,
      dimensions,
      index,
      optionsOpen,
      user,
    } = this.props;

    const { handle } = this.state;

    if (!dimensions) {
      return null;
    }

    const localStream = this._isStreamLocal();

    const cx = classnames('cams__CamWrapper',
      {
        'clear-fix': index % dimensions.x === 0,
      });

    const camOverlayCx = classnames('cams__CamOverlay',
      {
        open: optionsOpen,
        'cams__CamOverlay-noCam': (!streamData.stream || !videoEnabled || feed.userClosed) && !feed.loading,
        'cams__CamOverlay-micOnly': !feed.video && !feed.loading,
      });

    const style = {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
    };

    return (
      <div
        className={cx}
        style={style}
        ref={(e) => { this.camwrapper = e; }}
        onClick={this._handleClickWrapper}
        role="button"
        tabIndex="-1"
      >
        <div
          className={
            classnames('cams__Cam', {
              'cams__Cam-audioActive': feed.audioActive,
            })
          }
        >
          {feed.loading && (
            <div className="cams__LoadingWrapper">
              <Loading loading />
            </div>
          )}
          <video
            className="cams__CamVideo"
            id={streamData.userId}
            ref={(e) => { this.stream = e; }}
            autoPlay
            playsInline
            muted={localStream}
          />
          <div className="cams__CamWatermark" />
          <div className={camOverlayCx}>
            {!localStream && (
              <RoomCamOptions
                clientUser={user}
                user={this._getCamUser()}
                open={optionsOpen}
                feed={feed}
              />
            )}

            {!localStream && (
              <button
                className="cams__CamControl cams__FullscreenOption"
                type="button"
                title="Fullscreen"
                onClick={this.handleFullscreen}
              >
                <i className="fa fa-expand" aria-hidden="true" />
              </button>
            )}

            <RoomCamAudioActions
              isLocalStream={localStream}
              feed={feed}
              volume={feed.volume}
            />

            {!localStream && (
              <button
                className="cams__CamControl cams__ReportAction"
                type="button"
                title="Report user"
                onClick={this.handleReport}
              >
                <i className="fa fa-flag" aria-hidden="true" />
              </button>
            )}

          </div>
          <div className="cams__CamHandle">{handle}</div>
        </div>
      </div>
    );
  }
}

RoomCam.defaultProps = {
  optionsOpen: false,
  streamData: {},
  feed: {},
  users: [],
  user: null,
  dimensions: {
    width: 0, height: 0, x: 0, y: 0,
  },
  index: 0,
  videoEnabled: false,
  audioContext: null,
};

RoomCam.propTypes = {
  optionsOpen: PropTypes.bool,
  streamData: PropTypes.object,
  feed: PropTypes.object,
  users: PropTypes.array,
  user: PropTypes.shape({
    hasChangedHandle: PropTypes.bool.isRequired,
  }),
  dimensions: PropTypes.object,
  index: PropTypes.number,
  videoEnabled: PropTypes.bool,
  audioContext: PropTypes.object,
};

export default withErrorBoundary(RoomCam);
