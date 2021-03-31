/* global window */
import { EventEmitter } from 'events';
import { CamDispatcher } from '../../dispatcher/AppDispatcher';
import * as types from '../../constants/ActionTypes';
import { newRemoteFeed } from '../../utils/CamUtil';
import { addNotification } from '../../actions/NotificationActions';
import { trackEvent } from '../../utils/AnalyticsUtil';
import { get, set } from '../../utils/localStorage';
import UserStore from '../UserStore';
import { BUSY_BROADCAST_THRESHOLD } from '../../constants/RoomConstants';

const storageKey = 'settingsCams';
export const PTT_SETTING_KEY = 'audioPtt';

export class CamStore extends EventEmitter {
  constructor() {
    super();
    let audioContext = null;

    if (window.AudioContext) {
      audioContext = new AudioContext();
    }

    const state = get(storageKey);

    this.state = {
      feeds: [],
      cams: [],
      localStream: null,
      canBroadcast: false,
      isBroadcasting: false,
      activeTimeout: null,
      hasSetHandle: false,
      audioPtt: true,
      allFeedsHd: true,
      localAudioActive: false,
      qualityOptions: [],
      audioContext,
      globalVolume: 100,
      ...state,
    };

    this.newRemoteFeed = newRemoteFeed;
    this.addNotification = addNotification;

    this.timeoutDuration = 1000 * 60 * 10;
    this.timeoutDurationNoHandle = 1000 * 60 * 2;
  }

  getHasLocalStream() {
    return this.state.feeds.find(({ userId }) => userId === 'local');
  }

  getState() {
    return this.state;
  }

  setLocalStream(localStream) {
    this.state = {
      ...this.state,
      localStream,
    };
  }

  filterRemoteFeeds() {
    return this.state.feeds.filter(feed => feed.userId !== 'local');
  }

  setStreamCanBroadcast(canBroadcast) {
    this.state = {
      ...this.state,
      canBroadcast,
    };
  }


  removeStream(rfid, userClosed = false) {
    if (!rfid && this.state.isBroadcasting) {
      trackEvent('Cams', 'Stop broadcasting');
    }

    // if userClosed, then we only need to hide the stream
    // so setting the associated cam stream to null should suffice
    if (userClosed) {
      this.state = {
        ...this.state,
        cams: this.state.cams.map((cam) => {
          if (cam.feedId === rfid) {
            return { ...cam, stream: null };
          }

          return cam;
        }),
      };
      return;
    }

    // otherwise, removing the feed and cam is required
    if (rfid) {
      this.state = {
        ...this.state,
        feeds: this.state.feeds.filter((feed) => {
          if (feed.remoteFeed) {
            return feed.remoteFeed.rfid !== rfid;
          }

          return true;
        }),
        cams: this.state.cams.filter(cam => cam.feedId !== rfid),
      };

      return;
    }

    this.state = {
      ...this.state,
      feeds: this.state.feeds.filter(feed => feed.userId !== 'local'),
      cams: this.state.cams.filter(cam => cam.userId !== 'local'),
    };
  }

  /**
   * Hang up a stream and terminate it's connection to the client, then
   * close the cam.
   *
   * @param {String} id - userId of feed
   */
  hangupStream(id) {
    const feedToHangup = this.state.feeds.find(feed => feed.userId === id).remoteFeed;

    feedToHangup.hangup();
    this.removeStream(this.state.cams.find(cam => cam.userId === id).feedId, true);

    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === id) {
          return {
            ...feed,
            userClosed: true,
            loading: false,
          };
        }

        return feed;
      }),
    };
  }

  setFeedAudioActive(rfid, audioActive) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((f) => {
        if (f.remoteFeed && f.remoteFeed.rfid === rfid) {
          return {
            ...f,
            audioActive,
          };
        }

        return f;
      }),
    };
  }


  addStream(streamData) {
    const {
      janusId,
      remoteFeed,
      userId,
      roomId,
      token,
      userClosed,
      isLocal,
      video,
      audio,
      stream,
    } = streamData;

    let feedId;

    if (!remoteFeed) {
      feedId = 'local';
      const hasVideo = stream.getVideoTracks().length > 0;

      this.state = {
        ...this.state,
        feeds: [
          ...this.state.feeds, {
            userId: 'local',
            video: hasVideo,
            audio,
          },
        ],
        cams: [
          ...this.state.cams, {
            janusId,
            stream,
            token,
            userId: 'local',
            feedId,
            isLocal,
          }],
      };
      return;
    }

    const existingFeed = this.state.feeds.find(feed => feed.userId === userId);

    if (existingFeed) {
      this.state = {
        ...this.state,
        feeds: this.state.feeds.map((feed) => {
          if (feed.userId === userId) {
            const updatedRemoteFeed = { ...feed.remoteFeed, ...streamData.remoteFeed };

            return {
              ...feed,
              userClosed: this.state.camsDisabled,
              remoteFeed: updatedRemoteFeed,
              loading: !this.state.camsDisabled,
            };
          }

          return feed;
        }),
        cams: this.state.cams.map((cam) => {
          if (cam.userId === userId) {
            return { ...cam, stream };
          }

          return cam;
        }),
      };
    } else {
      this.state = {
        ...this.state,
        feeds: [
          ...this.state.feeds,
          {
            remoteFeed,
            userId,
            roomId,
            userClosed,
            optionsOpen: false,
            volume: this.state.globalVolume,
            showVolume: false,
            loading: !this.state.camsDisabled,
            video,
            audio,
            quality: this.state.allFeedsHd ? 2 : 0,
          },
        ],
        cams: [
          ...this.state.cams,
          {
            janusId,
            stream: userClosed ? null : stream,
            token,
            userId,
            feedId: remoteFeed.rfid,
          },
        ],
      };

      if (this.state.camsDisabled) {
        this.hangupStream(userId);
      }

      this.setReceiveSubstream(userId, this.state.allFeedsHd ? 2 : 0);
    }
  }

  resumeStream(id) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === id) {
          return {
            ...feed,
            loading: true,
          };
        }

        return feed;
      }),
    };

    const feedToResume = this.state.feeds.find(feed => feed.userId === id);
    this.newRemoteFeed(
      feedToResume.remoteFeed.rfid,
      feedToResume.roomId,
      feedToResume.userId,
      feedToResume.video,
    );
  }

  setFeedIsLoading(userId, loading) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === userId) {
          return {
            ...feed,
            loading,
          };
        }

        return feed;
      }),
    };
  }

  getCamFromFeed(userId) {
    return this.state.cams.find(cam => cam.userId === userId);
  }

  disableAllCams() {
    this.state.feeds.forEach((feed) => {
      const cam = this.getCamFromFeed(feed.userId);
      if (!!cam.stream && feed.userId !== 'local') {
        this.hangupStream(feed.userId);
      }
    });
  }

  enableAllCams() {
    this.state.feeds.forEach((feed) => {
      const cam = this.getCamFromFeed(feed.userId);
      if (!cam.stream && feed.userId !== 'local') {
        this.resumeStream(feed.userId);
      }
    });
  }

  setReceiveSubstream(id, substream) {
    const feed = this.state.feeds.find(({ userId }) => userId === id);
    const message = {
      request: 'configure',
      substream,
    };

    feed.remoteFeed.send({ message });

    const feeds = this.state.feeds.map((f) => {
      if (f.userId === id) {
        return {
          ...f,
          quality: substream,
        };
      }

      return f;
    });

    this.state = {
      ...this.state,
      feeds,
      allFeedsHd: feeds
        .filter(f => f.id !== 'local')
        .every(({ quality }) => (quality === 2)),
    };
  }

  setAllFeedQuality(substream) {
    const state = {
      ...get(storageKey),
      allFeedsHd: substream === 2,
    };

    this.state.feeds.forEach((feed) => {
      if (feed.userId !== 'local') {
        this.setReceiveSubstream(feed.userId, substream);
      }
    });

    this.state = {
      ...this.state,
      allFeedsHd: substream === 2,
    };

    set(storageKey, state);
  }

  muteRemoteStream(userId) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === userId) {
          return { ...feed, audioEnabled: !feed.audioEnabled };
        }

        return feed;
      }),
    };
  }

  muteAllRemoteStreams(mute) {
    const state = {
      ...get(storageKey),
    };

    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === 'local') {
          return feed;
        }

        return { ...feed, volume: mute ? 0 : 100 };
      }),
    };

    set(storageKey, state);
  }

  setStreamOptionsState(userId, open) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === userId) {
          if (open === undefined || open === null) {
            return { ...feed, optionsOpen: !feed.optionsOpen };
          }

          return { ...feed, optionsOpen: open };
        }

        return { ...feed, optionsOpen: false };
      }),
    };
  }


  setCamsDisabled(camsDisabled) {
    this.state = {
      ...this.state,
      camsDisabled,
    };
    this.emitChange();
  }

  /**
   * start the inactivity timeout. Default duration is set to 10 minutes,
   * after which the remote broadcasts will be disabled.
   *
   * @param {Number} (duration) - duration in seconds
   */
  startTimeout(duration = this.timeoutDuration) {
    if (!this.filterRemoteFeeds().length) {
      return null;
    }

    return setTimeout(() => {
      if (!this.state.isBroadcasting) {
        this.setCamsDisabled(true);
        this.disableAllCams();

        this.addNotification({
          color: 'blue',
          message: 'Cams closed due to inactivity',
          autoClose: false,
        });
      }
    }, duration);
  }

  /**
   * clear timeout and restart
   */
  resetTimeout() {
    clearTimeout(this.state.activeTimeout);
    this.state.activeTimeout = this.startTimeout();
  }

  /**
   * set whether the client user is broadcasting. If so
   * the timeout should be disabled.
   *
   * @param {boolean} isBroadcasting
   */
  setIsBroadcasting(isBroadcasting) {
    this.state = {
      ...this.state,
      isBroadcasting,
    };

    clearTimeout(this.state.activeTimeout);

    // if the user isn't broadcasting, restart the timer
    if (!isBroadcasting) {
      this.state = {
        ...this.state,
        activeTimeout: this.setShouldRunTimeout(),
      };
    }
  }

  /**
   * set whether the client user has set a handle after
   * joining a room. Determines which time to use
   * for the timeout.
   */
  setUserHasHandle() {
    this.state = {
      ...this.state,
      hasSetHandle: true,
    };
    this.resetTimeout();
  }

  /**
   * reset the timer when the user sends a message.
   * If, however, the user is broadcasting, do nothing
   * as broadcasting counts as activity.
   */
  setSentMessage() {
    if (!this.state.isBroadcasting) {
      this.resetTimeout();
    }
  }

  setShouldRunTimeout() {
    clearTimeout(this.state.activeTimeout);
    const { user } = UserStore.getState();
    if (user.isGold) {
      return;
    }

    if (this.filterRemoteFeeds().length > 0 && !this.state.camsDisabled) {
      // clear previous timeouts, to
      // prevent multiple simultaneous timeouts
      this.state = {
        ...this.state,
        activeTimeout: this
          .startTimeout(this.state.hasSetHandle
            ? this.timeoutDuration
            : this.timeoutDurationNoHandle),
      };
    }
  }

  setDefaultPtt(forcePtt) {
    const savedAudioPtt = get(PTT_SETTING_KEY, undefined);
    let audioPtt = false;
    if (forcePtt) {
      audioPtt = forcePtt;
    } else if (savedAudioPtt !== undefined && savedAudioPtt !== null) {
      audioPtt = savedAudioPtt;
    } else {
      audioPtt = this.filterRemoteFeeds().length >= BUSY_BROADCAST_THRESHOLD;
    }

    this.state = {
      ...this.state,
      audioPtt,
      localAudioActive: !audioPtt,
    };
  }

  setAudioPtt(audioPtt) {
    this.state = {
      ...this.state,
      audioPtt,
    };

    set(PTT_SETTING_KEY, audioPtt);
  }

  setFeedVolume(rfid, volume) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.remoteFeed && feed.remoteFeed.rfid === rfid) {
          return {
            ...feed,
            volume,
          };
        }

        return feed;
      }),
    };
  }

  setFeedVolumeSlider(rfid, showVolume) {
    this.state = {
      ...this.state,
      feeds: this.state.feeds.map((feed) => {
        if (feed.remoteFeed && feed.remoteFeed.rfid === rfid) {
          return {
            ...feed,
            showVolume,
          };
        }

        return {
          ...feed,
          showVolume: false,
        };
      }),
    };
  }

  setLocalAudioActive(localAudioActive) {
    this.state = {
      ...this.state,
      localAudioActive,
    };
  }

  async resumeAudioContext() {
    const { audioContext } = this.state;

    try {
      await audioContext.resume();
    } catch (err) {
      console.error({ err }, 'failed to resume audio context');
      this.addNotification({
        color: 'yellow',
        message: 'Audio context could not resume',
        autoClose: true,
      });
    }
  }

  setQualityOptions(qualityOptions) {
    this.state = {
      ...this.state,
      qualityOptions,
    };
  }

  setGlobalStreamVolume(volume) {
    const state = {
      ...get(storageKey),
      globalVolume: volume,
    };

    this.state = {
      ...this.state,
      globalVolume: volume,
      feeds: this.state.feeds.map((feed) => {
        if (feed.userId === 'local') {
          return feed;
        }

        return {
          ...feed,
          volume,
        };
      }),
    };

    set(storageKey, state);
  }

  // Emit Change event
  emitChange() {
    this.emit('change');
  }

  // Add change listener
  addChangeListener(callback) {
    this.on('change', callback);
  }

  // Remove change listener
  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}


const camStore = new CamStore();

camStore.dispatchToken = CamDispatcher.register(({ action }) => {
  switch (action.actionType) {
    case types.STREAM_LOCAL_CAN_BROADCAST:
      camStore.setStreamCanBroadcast(action.canBroadcast);
      break;

    case types.STREAM_LOCAL_ADD:
      if (!camStore.getHasLocalStream()) {
        camStore.setLocalStream(action.data);
        camStore.addStream(action.data);
        camStore.setIsBroadcasting(true);
      }
      break;

    case types.STREAM_REMOTE_ADD:
      camStore.addStream(action.data);
      camStore.setShouldRunTimeout();
      break;

    case types.STREAM_REMOTE_DESTROY:
      camStore.removeStream(action.id, action.userHangup);
      camStore.setShouldRunTimeout();
      break;

    case types.STREAM_REMOTE_HANGUP:
      camStore.hangupStream(action.id);
      break;

    case types.STREAM_REMOTE_RESUME:
      camStore.resumeStream(action.id);
      break;

    case types.STREAM_HANGUP_ALL:
      camStore.disableAllCams();
      camStore.setCamsDisabled(true);
      break;

    case types.STREAM_RESUME_ALL:
      camStore.enableAllCams();
      camStore.setCamsDisabled(false);
      break;

    case types.STREAM_AUDIO_TOGGLE_MUTE:
      camStore.muteRemoteStream(action.userId);
      break;

    case types.STREAM_AUDIO_TOGGLE_MUTE_ALL:
      camStore.muteAllRemoteStreams(action.mute);
      break;

    case types.STREAM_AUDIO_SET_GLOBAL_VOLUME:
      camStore.setGlobalStreamVolume(action.volume);
      break;

    case types.STREAM_LOCAL_DESTROY:
      camStore.removeStream();
      camStore.setIsBroadcasting(false);
      camStore.setLocalStream(null);
      break;

    case types.SET_STREAM_OPTIONS_STATE:
      camStore.setStreamOptionsState(action.userId, action.open);
      break;

    case types.MESSAGE_SEND:
      camStore.setSentMessage();
      break;
    case types.CLIENT_UPDATE_HANDLE:
      camStore.setUserHasHandle();
      break;
    case types.SET_DEFAULT_PTT:
      camStore.setDefaultPtt(action.forcePtt);
      break;
    case types.SET_CLIENT_PTT:
      camStore.setAudioPtt(action.audioPtt);
      camStore.setLocalAudioActive(!action.audioPtt);
      break;
    case types.STREAM_AUDIO_SET_ACTIVE:
      camStore.setFeedAudioActive(action.rfid, action.audioActive);
      break;
    case types.STREAM_SET_LOADING:
      camStore.setFeedIsLoading(action.userId, action.loading);
      break;
    case types.SET_REMOTE_STREAM_VOLUME:
      camStore.setFeedVolume(action.rfid, action.volume);
      break;
    case types.STREAM_SHOW_VOLUME_SLIDER:
      camStore.setFeedVolumeSlider(action.rfid, action.show);
      break;
    case types.SET_LOCAL_AUDIO_ACTIVE:
      camStore.setLocalAudioActive(action.active);
      break;

    case types.RESUME_AUDIO_CONTEXT:
      camStore.resumeAudioContext();
      break;

    case types.STREAM_SET_QUALITY:
      camStore.setAllFeedQuality(action.substream);
      break;

    case types.SET_QUALITY_OPTIONS:
      camStore.setQualityOptions(action.qualityOptions);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  camStore.emitChange();

  return true;
});

export default camStore;
