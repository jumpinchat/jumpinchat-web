/**
 * Created by Zaccary on 20/06/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { layouts } from '../../../constants/RoomConstants';
import pack from '../../../utils/pack.util';
import withErrorBoundary from '../../../utils/withErrorBoundary';
import RoomCam from './RoomCam.react';
import YoutubeVideoContainer from '../youtube/YoutubeVideoContainer.react';
import RoomCamsHeader from './RoomCamsHeader.react';
import RoomCamsFooter from './RoomCamsFooter.react';

export class RoomCams extends Component {
  static getFeedsUpdated(current, previous) {
    const getFeedId = (feed) => {
      if (feed.remoteFeed) {
        return feed.remoteFeed.rfid;
      }

      return 'local';
    };

    const currentFeeds = current.map(getFeedId).join('');
    const prevFeeds = previous.map(getFeedId).join('');

    return previous.length > 0 && (currentFeeds !== prevFeeds);
  }

  static calcMaxWidth(height, x, y) {
    return Math.ceil(((height / y) / 0.75) * x);
  }

  constructor(props) {
    super(props);
    this.pack = pack;
    this._getCamDimensions = this._getCamDimensions.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.state = {
      camDimensions: null,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
    const {
      feeds,
      currentlyPlaying,
    } = this.props;

    const diffPlaying = nextProps.currentlyPlaying !== currentlyPlaying;
    const feedsUpdated = RoomCams.getFeedsUpdated(feeds, nextProps.feeds);

    if (feedsUpdated || diffPlaying) {
      this._getCamDimensions(nextProps);
    }
  }

  componentDidUpdate(prev) {
    const { feeds, layout } = this.props;
    const layoutUpdated = layout !== prev.layout;

    const feedsUpdated = RoomCams.getFeedsUpdated(feeds, prev.feeds);

    if (feedsUpdated || layoutUpdated) {
      this._getCamDimensions(this.props);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }

  handleResize() {
    return window.requestAnimationFrame(this._getCamDimensions.bind(this));
  }

  _getCamDimensions(nextProps) {
    const props = nextProps && nextProps.feeds ? nextProps : this.props;
    const camCount = props.feeds.length;

    if (!this.containerInternal || !this.camwrapper) {
      return;
    }

    const camWrapperHeight = this.containerInternal.offsetHeight;

    const camContainerWidth = this.camwrapper.offsetWidth;

    this.setState({
      camDimensions: this.pack(camCount, camContainerWidth, camWrapperHeight),
      camWrapperHeight,
      camContainerWidth,
    });
  }


  render() {
    const {
      layout,
      localStream,
      canBroadcast,
      feeds,
      cams,
      room,
      currentlyPlaying,
      ytOptionsOpen,
      ytVolume,
      audioPtt,
      audioContext,
      playYoutubeVideos,
      userCount,
      localAudioActive,
      showYoutubeVolume,
      user,
      users,
      broadcastRestricted,
      camsDisabled,
      canPlayMedia,
      feedsHighDef,
      feedsMuted,
      settingsOptionsOpen,
      chatColors,
      globalVolume,
    } = this.props;

    const { camDimensions, camWrapperHeight, camContainerWidth } = this.state;

    let camWrapperStyle;
    if (camWrapperHeight && camDimensions) {
      const computedMaxWidth = RoomCams
        .calcMaxWidth(camWrapperHeight, camDimensions.x, camDimensions.y);

      if (camContainerWidth > computedMaxWidth) {
        camWrapperStyle = {
          maxWidth: `${computedMaxWidth}px`,
        };
      }
    }

    const enlargedVidDimensions = {
      width: this.containerInternal ? this.containerInternal.offsetHeight / 0.75 : 0,
      height: this.containerInternal ? this.containerInternal.offsetHeight : 0,
    };

    return (
      <div className="cams" ref={(e) => { this.camcontainer = e; }}>
        <RoomCamsHeader
          room={room}
          localStream={localStream}
          feedCount={feeds.length}
          userCount={userCount}
          canBroadcast={canBroadcast}
          localAudioActive={localAudioActive}
          audioPtt={audioPtt}
          audioContext={audioContext}
          broadcastRestricted={broadcastRestricted}
        />
        <div
          className="cams__ContainerInternal"
          ref={(e) => { this.containerInternal = e; }}
        >
          {!!currentlyPlaying
            && user.settings.playYtVideos
            && (
              <YoutubeVideoContainer
                videoDetails={currentlyPlaying}
                dimensions={enlargedVidDimensions}
                onVideoReady={this._getCamDimensions}
                optionsOpen={ytOptionsOpen}
                volume={ytVolume}
                onVideoEnd={() => { setTimeout(this._getCamDimensions, 100); }}
                showVolumeControl={showYoutubeVolume}
                userIsOperator={!!user.operator_id}
                hasChangedHandle={user.hasChangedHandle}
              />
            )}

          <div
            className="cams__Wrapper"
            id="cam-wrapper"
            style={camWrapperStyle}
            ref={(e) => { this.camwrapper = e; }}
          >
            {feeds.map((feed, index) => {
              const cam = cams.find(c => c.userId === feed.userId);
              return (
                <RoomCam
                  optionsOpen={feed.optionsOpen}
                  streamData={cam}
                  feed={feed}
                  users={users}
                  user={user}
                  dimensions={camDimensions}
                  key={cam.userId}
                  index={index}
                  videoEnabled={!!cam.stream}
                  audioContext={audioContext}
                />
              );
            })}
          </div>
        </div>
        {layout === layouts.HORIZONTAL && (
          <RoomCamsFooter
            user={user}
            roomName={room.name}
            feedsCount={feeds.length}
            camsDisabled={camsDisabled}
            canPlayMedia={canPlayMedia}
            feedsHighDef={feedsHighDef}
            feedsMuted={feedsMuted}
            settingsOptionsOpen={settingsOptionsOpen}
            chatColors={chatColors}
            playYoutubeVideos={playYoutubeVideos}
            modOnlyPlayMedia={room.settings.modOnlyPlayMedia}
            layout={layout}
            roomHasOwner={Boolean(room.attrs.owner)}
            globalVolume={globalVolume}
          />
        )}
      </div>
    );
  }
}

RoomCams.defaultProps = {
  room: null,
  userCount: 0,
  feeds: [],
  cams: [],
  canBroadcast: false,
  localStream: null,
  user: null,
  currentlyPlaying: null,
  ytOptionsOpen: false,
  ytVolume: 1,
  audioPtt: true,
  audioContext: null,
};

RoomCams.propTypes = {
  room: PropTypes.object,
  userCount: PropTypes.number,
  feeds: PropTypes.array,
  cams: PropTypes.array,
  canBroadcast: PropTypes.bool,
  localStream: PropTypes.object,
  user: PropTypes.object,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentlyPlaying: PropTypes.shape({
    mediaId: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
  }),
  ytOptionsOpen: PropTypes.bool,
  ytVolume: PropTypes.number,
  audioPtt: PropTypes.bool,
  audioContext: PropTypes.object,
  playYoutubeVideos: PropTypes.bool.isRequired,
  localAudioActive: PropTypes.bool.isRequired,
  showYoutubeVolume: PropTypes.bool.isRequired,
  broadcastRestricted: PropTypes.bool.isRequired,
  feedsMuted: PropTypes.bool.isRequired,
  camsDisabled: PropTypes.bool.isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  feedsHighDef: PropTypes.bool.isRequired,
  settingsOptionsOpen: PropTypes.bool.isRequired,
  canPlayMedia: PropTypes.bool.isRequired,
  modOnlyPlayMedia: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  globalVolume: PropTypes.number.isRequired,
};

export default withErrorBoundary(RoomCams);
