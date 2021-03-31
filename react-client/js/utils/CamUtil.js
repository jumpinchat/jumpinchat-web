/**
 * Created by Zaccary on 09/09/2015.
 */

/* global navigator,Janus,window */

import React from 'react';
import uuid from 'uuid';
import request from 'superagent';
import camStore from '../stores/CamStore/CamStore';
import {
  destroyLocalStream,
  addRemoteStream,
  destroyRemoteStream,
  addLocalStream,
  setFeedLoading,
  resumeAllRemoteStreams,
} from '../actions/CamActions';

import { sendUserBroadcastState } from './RoomAPI';
import { addNotification } from '../actions/NotificationActions';
import {
  setModalError,
  setMediaSelectionModal,
  setMediaDeviceId,
  setMediaSelectionModalLoading,
} from '../actions/ModalActions';
import { trackEvent } from './AnalyticsUtil';
import {
  defaultVideoConstraints,
  getVideoConstraints,
} from '../constants/MediaConstants';

let janus = null;
let janusMcuPlugin = null;
let slowlinkTimeout;


const closeBroadcast = () => {
  destroyLocalStream(null);
  setMediaDeviceId(null, 'video');
  setMediaDeviceId(null, 'audio');
};

const getResponseError = (response) => {
  const error = new Error();
  error.name = 'RequestError';
  error.message = response.body || response.statusText;
  error.code = response.statusCode;

  return error;
};

const getServerEndpoints = () => new Promise((resolve, reject) => {
  request
    .get('/api/janus/endpoints')
    .end((err, response) => {
      if (err) {
        return reject(err);
      }

      if (response.statusCode >= 400) {
        const error = getResponseError(response);
        return reject(error);
      }

      return resolve(response.body);
    });
});

const getTurnCreds = () => new Promise((resolve, reject) => {
  request
    .get('/api/turn/')
    .end((err, response) => {
      if (err) {
        return reject(err);
      }

      if (response.statusCode >= 400) {
        const error = getResponseError(response);
        return reject(error);
      }

      return resolve(response.body);
    });
});

const getToken = () => new Promise((resolve, reject) => {
  request
    .get('/api/janus/token')
    .end((err, response) => {
      if (err) {
        return reject(err);
      }

      if (response.statusCode >= 400) {
        const error = getResponseError(response);
        return reject(error);
      }

      if (!response.body || !response.body.token) {
        const error = new Error('missing authentication token');
        trackEvent('Error', 'Cam Util', error.name);
        return reject(error);
      }

      return resolve(response.body.token);
    });
});

/**
 * gets janus endpoints and turn data
 * required to init a janus session
 * @param cb
 */
const getServerInfo = function getServerInfo(roomName, cb) {
  const data = {
    endpoints: null,
    turnData: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  };

  Promise.all([
    getServerEndpoints(),
    getTurnCreds(),
    getToken(),
  ])
    .then(([endpoints, turnData, token]) => {
      console.log({ endpoints, turnData, token });
      data.endpoints = endpoints;

      turnData.uris.forEach((uri) => {
        data.turnData.push({
          urls: uri,
          username: turnData.username,
          credential: turnData.password,
        });
      });

      data.token = token;

      return cb(null, data);
    })
    .catch((err) => {
      console.error(err);
      trackEvent('Error', 'Cam Util', 'fetching requirements failed');
      let errorString;
      if (err.constructor() === 'Error') {
        errorString = err.toString();
      } else {
        try {
          errorString = JSON.stringify(err);
        } catch (e) {
          console.error(e);
        }
      }
      trackEvent('Error', 'Cam Util', `Fetch requirements: ${errorString}`);
      addNotification({
        color: 'red',
        message: 'Error connecting to media server',
        autoClose: false,
      });
      if (window.Raven) {
        const error = new Error();
        error.name = err.name;
        error.message = err.message;
        window.Raven.captureException(err);
      }
      return cb(err);
    });
};

function publishOwnFeed(isGold, videoQuality, videoDevice, audioDevice, sendAudio = false) {
  // Publish our stream
  console.log('publish own feed', { isGold, videoQuality });
  let media = {
    audioRecv: false,
    videoRecv: false,
    audioSend: true,
    videoSend: false,
  };

  if (videoDevice) {
    media = {
      ...media,
      videoSend: true,
      video: {
        deviceId: {
          exact: videoDevice,
        },
        ...defaultVideoConstraints,
      },
    };
  }

  if (isGold) {
    media.video = {
      ...media.video,
      ...getVideoConstraints(videoQuality),
    };
  }

  if (videoDevice === 'screen') {
    media = {
      ...media,
      video: 'screen',
      screenshareFrameRate: 15,
    };
  } else {
    media = {
      ...media,
      audio: {
        deviceId: {
          exact: audioDevice,
        },
      },
    };
  }

  let simulcastMaxBitrates;

  if (isGold) {
    simulcastMaxBitrates = {
      high: videoQuality.bitRate,
      medium: 0,
      low: 128000,
    };
  }

  const shouldSimulcast = videoQuality
    && videoQuality.id !== 'VIDEO_240'
    && isGold;

  janusMcuPlugin.createOffer(
    {
      media,
      simulcast: shouldSimulcast,
      simulcastMaxBitrates,
      // Publishers are sendonly
      success(jsep) {
        const message = {
          request: 'configure',
          audio: true,
          video: true,
          bitrate: isGold ? videoQuality.bitRate : undefined,
        };

        janusMcuPlugin.send({ message, jsep });

        if (!sendAudio) {
          janusMcuPlugin.muteAudio();
        }

        sendUserBroadcastState(true);

        // because screensharing is weird and
        // uses built-in browser selection windows
        setMediaSelectionModal(false);
        setMediaSelectionModalLoading(false);
      },

      error(err) {
        console.error('WebRTC error:', err);
        if (error.message === 'NavigatorUserMediaError') {
          trackEvent('Error', 'Cam Util', 'missing screen sharing plugin');
          setModalError({
            message: (
              <span>
                You are missing the
                <a
                  href="https://chrome.google.com/webstore/detail/janus-webrtc-screensharin/hapfgfdkleiggjjpfpenajgdnfckjpaj?hl=en"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  &nbsp;required plugin&nbsp;
                </a>
                to use screensharing
              </span>
            ),
          });
        } else {
          console.error(err);
          if (err.name === 'NotReadableError') {
            addNotification({
              color: 'red',
              message: 'Media source is inaccessable',
              autoClose: false,
            });
          } else if (err.name === 'NotAllowedError') {
            addNotification({
              color: 'red',
              message: error.message,
              autoClose: false,
            });
          } else {
            addNotification({
              color: 'red',
              message: 'Unable to broadcast',
              autoClose: false,
            });
          }

          trackEvent('Error', 'Cam Util', `Create offer: ${err.toString()}`);
          if (window.Raven) {
            const error = new Error();
            error.name = err.name;
            error.message = err.message;
            window.Raven.captureException(error);
          }
          setMediaSelectionModal(false);
        }

        setMediaSelectionModalLoading(false);
        closeBroadcast();
      },
    },
  );
}


export function publish(isGold, videoQuality, videoDevice, audioDevice, sendAudio = false) {
  if (!janusMcuPlugin) {
    console.error('Plugin is not initialized');
    trackEvent('Error', 'Cam Util', 'Plugin is not initialized');

    addNotification({
      color: 'red',
      message: 'Unable to broadcast, please refresh',
      autoClose: false,
    });

    closeBroadcast();

    return;
  }

  publishOwnFeed(isGold, videoQuality, videoDevice, audioDevice, sendAudio);
}

export function setAudioState(state) {
  if (!state) {
    janusMcuPlugin.muteAudio();
  } else {
    janusMcuPlugin.unmuteAudio();
  }
}

export function unpublishOwnFeed() {
  // Unpublish our stream
  const message = { request: 'unpublish' };
  janusMcuPlugin.send({ message });
  sendUserBroadcastState(false);
}

function checkVideoSupported() {
  const isSafari = Janus.webRTCAdapter.browserDetails.browser === 'safari';

  if (isSafari) {
    return Janus.safariVp8;
  }

  return true;
}

export function newRemoteFeed(id, roomId, userId, video, audio) {
  // A new feed has been published, create a new plugin handle and attach to it as a listener
  let remoteFeed;
  janus.attach(
    {
      plugin: 'janus.plugin.videoroom',
      opaqueId: userId,
      success(pluginHandle) {
        remoteFeed = pluginHandle;
        const videoSupported = checkVideoSupported();

        // We wait for the plugin to send us an offer
        const message = {
          request: 'join',
          room: roomId,
          ptype: 'subscriber',
          feed: id,
          offer_video: videoSupported,
        };

        if (!videoSupported) {
          addNotification({
            color: 'yellow',
            message: 'Video not supported, receiving audio only',
          });
        }

        remoteFeed.send({ message });
      },
      error(error) {
        console.error('Error attaching plugin... ', error);
        trackEvent('Error', 'Cam Util', `Error attaching plugin: ${error}`);

        addNotification({
          color: 'red',
          message: 'Error receiving broadcast',
        });
      },
      slowLink(uplink) {
        console.warn({ userId, uplink }, 'poor connection to remote feed');
      },
      onmessage(msg, jsep) {
        const event = msg.videoroom;
        console.log({ ...msg });

        if (!!event && event === 'attached') {
          remoteFeed.rfid = msg.id;
        }

        if (msg.started === 'ok') {
          console.log('feed started');
        }

        if (msg.substream !== undefined) {
          console.log({ substream: msg.substream });

          const { allFeedsHd } = camStore.getState();

          if (allFeedsHd && msg.substream !== 2) {
            remoteFeed.send({
              message: {
                request: 'configure',
                substream: 2,
              },
            });
          }

          if (!allFeedsHd && msg.substream !== 0) {
            remoteFeed.send({
              message: {
                request: 'configure',
                substream: 0,
              },
            });
          }
        }

        if (jsep !== undefined && jsep !== null) {
          // Answer and attach
          remoteFeed.createAnswer(
            {
              jsep,
              media: {
                audioSend: false,
                videoSend: false,
              },
              success(jsep) {
                const message = { request: 'start', room: roomId };
                remoteFeed.send({ message, jsep });
              },

              error(error) {
                console.error('WebRTC error', error);
                trackEvent('Error', 'Cam Util', `Remote feed error: ${error}`);

                addNotification({
                  color: 'red',
                  message: 'Error receiving broadcast',
                });
              },
            },
          );
        }
      },

      webrtcState(on) {
        Janus.log(`Janus says this WebRTC PeerConnection (feed #${remoteFeed.rfindex}) is ${on ? 'up' : 'down'} now`);
        if (on) {
          setFeedLoading(userId, false);
        }
      },
      onremotestream(stream) {
        let userClosed = false;

        const { camsDisabled } = camStore.getState();

        if (camsDisabled) {
          userClosed = true;
        }

        console.log('tracks', stream.getTracks());

        addRemoteStream({
          janusId: id,
          stream,
          remoteFeed,
          roomId,
          userId,
          userClosed,
          token: uuid.v4(),
          video,
          audio,
        });
      },
    },
  );
}

function reconnectFailed() {
  addNotification({
    color: 'red',
    message: 'Unable to reconect to media server',
    autoClose: false,
  });

  unpublishOwnFeed();
  return closeBroadcast();
}

const reconnectMethods = {
  RENEGOTIATE: 'RENEGOTIATE',
  RECONNECT: 'RECONNECT',
  RESTART: 'RESTART',
};

let reconnectAttempts = 0;
let reconnectMethod;
function reconnect() {
  const method = reconnectMethods.RECONNECT;
  console.log({ method });
  if (reconnectAttempts >= 5) {
    return reconnectFailed();
  }

  if (reconnectMethod && reconnectMethod !== method) {
    return null;
  }

  reconnectMethod = method;

  return setTimeout(() => {
    reconnectAttempts += 1;
    janus.reconnect({
      success: () => {
        console.log('janus reconnected');
        addNotification({
          color: 'blue',
          message: 'Reconnected to media server',
        });
        reconnectAttempts = 0;
        resumeAllRemoteStreams();
      },
      error: (error) => {
        console.error({ error }, 'failed to reconnect to janus');
        reconnect();
      },
    });
  }, 2000);
}

function renegotiate() {
  const method = reconnectMethods.RENEGOTIATE;
  console.log({ method });
  console.trace(method);
  if (reconnectAttempts >= 5) {
    return reconnectFailed();
  }

  if (reconnectMethod && reconnectMethod !== method) {
    return null;
  }

  reconnectMethod = method;

  addNotification({
    color: 'yellow',
    message: 'Attempting to reconect to media server',
  });

  return setTimeout(() => {
    janusMcuPlugin.createOffer(
      {
        media: {
          video: false,
          audio: false,
        },
        success: (jsep) => {
          reconnectAttempts = 0;

          addNotification({
            color: 'blue',
            message: 'Connection to media server restored',
          });

          janusMcuPlugin.send({
            message: { audio: true, video: true },
            jsep,
          });
        },
        error: (error) => {
          console.error({ error }, 'failed to reconnect to janus');
          reconnectAttempts += 1;
          renegotiate();
        },
      },
    );
  }, 2000);
}

function restartIce() {
  const method = reconnectMethods.RESTART;
  console.log({ method });
  if (reconnectAttempts >= 5) {
    return reconnectFailed();
  }

  if (reconnectMethod && reconnectMethod !== method) {
    return null;
  }

  reconnectMethod = method;

  return setTimeout(() => {
    janusMcuPlugin.createOffer(
      {
        iceRestart: true,
        media: {},
        success: (jsep) => {
          reconnectAttempts = 0;

          addNotification({
            color: 'blue',
            message: 'Connection to media server restored',
          });

          janusMcuPlugin.send({
            message: { audio: true, video: true },
            jsep,
          });
        },
        error: (error) => {
          console.error({ error }, 'failed to reconnect to janus');
          reconnectAttempts += 1;
          restartIce();
        },
      },
    );
  }, 2000);
}

export function init(roomId, roomName, userId, cb = () => {}) {
  console.log({ roomId, roomName, userId }, 'init');
  getServerInfo(roomName, (err, info) => {
    if (err) {
      console.error('error getting sever endpoints');
      addNotification({
        color: 'red',
        message: 'Error connecting to media server',
        autoClose: false,
      });
      return;
    }

    const { endpoints, turnData, token } = info;

    Janus.init({
      debug: process.env.NODE_ENV === 'production' ? 'error' : 'all',
      callback() {
        if (!Janus.isWebrtcSupported()) {
          console.warn('No WebRTC support... ');
          addNotification({
            color: 'red',
            message: 'Broadcasting is not supported on this browser',
            autoClose: false,
          });
          return;
        }

        // Create session
        janus = new Janus({
          server: endpoints,
          iceServers: turnData,
          token,
          keepAlivePeriod: 25000,
          success() {
            // Attach to video MCU test plugin
            janus.attach({
              plugin: 'janus.plugin.videoroom',
              token,
              success(pluginHandle) {
                janusMcuPlugin = pluginHandle;
                const message = {
                  request: 'join',
                  room: roomId,
                  ptype: 'publisher',
                  display: userId,
                };

                janusMcuPlugin.send({ message });

                // callback to indicate janus is initialized
                cb(null, true);
              },

              error(error) {
                console.error('  -- Error attaching plugin... ', error);
                trackEvent('Error', 'Cam Util', `error attaching plugin: ${error}`);
                addNotification({
                  color: 'red',
                  message: 'Error connecting to media server',
                  autoClose: false,
                });

                cb(error);
              },

              consentDialog(on) {
                console.log(`Consent dialog should be ${(on ? 'on' : 'off')} now`);
              },

              iceState(state) {
                if (state === 'disconnected') {
                  trackEvent('Error', 'Cam Util', 'ice disconnected');
                }

                if (state === 'failed') {
                  trackEvent('Error', 'Cam Util', 'ice failed');
                  restartIce();
                }
              },
              webrtcState(connected, reason) {
                console.log('::: peer connection established?', connected);
                if (connected) {
                  janusMcuPlugin.send({ message: { request: 'configure' } });
                } else {
                  console.error({ connected, reason });
                }
              },
              slowLink() {
                if (!slowlinkTimeout) {
                  trackEvent('Cams', 'Slow link');
                  addNotification({
                    color: 'yellow',
                    message: 'Poor connection to media server',
                  });

                  slowlinkTimeout = setTimeout(() => {
                    clearTimeout(slowlinkTimeout);
                  }, 1000 * 60 * 5);
                }
              },
              mediaState(type, on) {
                console.log('::: mediaState :::', type, on);
                if (type === 'video' && !on) {
                  renegotiate();
                  addNotification({
                    color: 'yellow',
                    message: 'Losing media server connection',
                  });
                }
              },

              onmessage(msg, jsep) {
                const event = msg.videoroom;

                if (event !== undefined && event !== null) {
                  if (event === 'joined') {
                    // Publisher/manager created, negotiate WebRTC and attach
                    // to existing feeds, if any

                    addNotification({
                      color: 'blue',
                      message: 'Connected to media server',
                    });

                    // Any new feed to attach to?
                    if (msg.publishers !== undefined && msg.publishers !== null) {
                      msg.publishers.forEach((publisher) => {
                        const video = publisher.video_codec;
                        const audio = publisher.audio_codec;
                        newRemoteFeed(publisher.id, roomId, publisher.display, video, audio);
                      });
                    }
                  }

                  if (event === 'destroyed') {
                    // The room has been destroyed
                    console.log('The room has been destroyed!');
                    trackEvent('Error', 'Cam Util', 'room was destroyed');
                    addNotification({
                      color: 'red',
                      message: 'Media server connection lost, refresh required',
                      autoClose: false,
                    });
                  }

                  if (event === 'event') {
                    // Any new feed to attach to?
                    if (msg.publishers !== undefined && msg.publishers !== null) {
                      msg.publishers.forEach((publisher) => {
                        const video = publisher.video_codec;
                        const audio = publisher.audio_codec;
                        newRemoteFeed(publisher.id, roomId, publisher.display, video, audio);
                      });
                    }

                    if (msg.unpublished !== undefined && msg.unpublished !== null) {
                      console.log('remote feed unpublished', msg);
                      // One of the publishers has unpublished?
                      destroyRemoteStream(msg.unpublished);
                    }

                    if (msg.error !== undefined && msg.error !== null) {
                      console.error(msg.error);
                      trackEvent('Error', 'Cam Util', `Error message from janus: ${msg.error}`);
                      if (msg.error.match(/^No such room/)) {
                        addNotification({
                          color: 'red',
                          message: 'Media connection lost, refresh required',
                          autoClose: false,
                        });
                      } else {
                        addNotification({
                          color: 'red',
                          message: 'Media server error',
                          autoClose: false,
                        });
                      }
                      closeBroadcast();
                    }
                  }
                }

                if (jsep !== undefined && jsep !== null) {
                  janusMcuPlugin.handleRemoteJsep({ jsep });
                }
              },

              onlocalstream(stream) {
                addLocalStream({ stream, token: uuid.v4(), isLocal: true });
              },

              oncleanup() {
                closeBroadcast();
              },
            });
          },

          error(error) {
            console.error('Janus error', error);
            trackEvent('Error', 'Cam Util', `Media server error: ${error}`);
            addNotification({
              color: 'yellow',
              message: 'Media connection lost',
              autoClose: true,
            });
            reconnect();
          },
        });
      },
    });
  });
}
