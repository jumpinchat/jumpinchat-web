const request = require('request');
const {
  toSeconds,
  parse,
} = require('iso8601-duration');
const redis = require('../../../lib/redis.util')();
const log = require('../../../utils/logger.util')({ name: 'playVideo.controller' });
const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');
const { getUserHasRolePermissions } = require('../../role/role.utils');
const {
  PermissionError,
} = require('../../../utils/error.util');

const {
  TYPE_YOUTUBE,
} = require('../../../config/constants/mediaTypes');

const encodeUriParams = require('../../../utils/encodeUriParams');

const roomUtils = require('../../room/room.utils');
const { getMediaByRoomId } = require('../playlist.utils');

class PlayVideo {
  static checkSocketPermission(socketId, room) {
    const user = room.users.find(u => u.socket_id === socketId);

    if (!user) {
      log.error('could not find user');
      return false;
    }

    return getUserHasRolePermissions(room.name, {
      userId: user.user_id,
      ip: user.ip,
      sessionId: user.session_id,
    }, 'controlMedia');
  }

  static getStartTime(videoInformation) {
    const {
      startTime,
      pausedAt,
    } = videoInformation;

    const currentTime = Date.now();
    const startTimestamp = new Date(startTime).getTime();

    if (pausedAt) {
      return Math.floor((new Date(pausedAt).getTime() - startTimestamp) / 1000);
    }

    return Math.floor((currentTime - startTimestamp) / 1000);
  }

  static async getPlaylistFromRoomName(roomName) {
    const roomId = await roomUtils.getRoomIdFromName(roomName);
    return getMediaByRoomId(roomId);
  }

  constructor() {
    this.redis = redis;
    this.request = request;
  }

  checkCache(videoId, cb) {
    this.redis.get(`yt:${videoId}`, cb);
  }

  saveVideoInfoToCache(videoInformation, cb) {
    const infoString = JSON.stringify(videoInformation);
    const key = `yt:${videoInformation.mediaId}`;

    return this.redis.set(key, infoString, (err) => {
      if (err) {
        log.fatal({ err }, 'failed to set video info in cache');
        return cb(err);
      }

      return this.redis.expire(key, config.yt.detailCacheExpire, cb);
    });
  }

  getVideoInformation(videoId, cb) {

    if (!videoId) {
      log.error('no video ID supplied');
      return cb(errors.ERR_SRV);
    }
    const urlParams = {
      key: config.yt.key,
      part: 'contentDetails,snippet',
      id: videoId,
      fields: 'items(id,snippet(channelId,title,thumbnails),contentDetails(duration))',
    };

    this.checkCache(videoId, (err, cache) => {
      if (err) {
        log.fatal({ err }, 'failed to retrieve video info from cache');
        return cb(err);
      }

      if (cache) {
        log.debug('retrieved video info from cache');
        return cb(null, JSON.parse(cache));
      }

      log.debug('no video info in cache');

      this.request({
        method: 'GET',
        url: `https://www.googleapis.com/youtube/v3/videos?${encodeUriParams(urlParams)}`,
        json: true,
      }, (err, response, body) => {
        if (err) {
          log.error({ err, videoId }, 'error fetching video details');
          return cb(err);
        }

        if (response.statusCode >= 400) {
          log.warn({ body }, `error code from yt api: ${response.statusCode}`);
          if (body.error && Array.isArray(body.error)) {
            const [error] = body.error;
            return cb({
              error: error.reason,
              message: error.message,
            });
          }
          return cb({
            error: 'ERR_YOUTUBE',
            message: 'An error occurred with the YouTube API',
          });
        }

        if (!body.items.length) {
          log.error({ body }, 'could not load video details');
          return cb({
            error: 'ERR_YOUTUBE',
            message: 'Could not load video details',
          });
        }

        const {
          contentDetails,
          snippet,
        } = body.items[0];

        if (!contentDetails) {
          log.error('Video details missing');
          return cb(new Error('ERR_YT_NO_DETAILS'));
        }

        const duration = toSeconds(parse(contentDetails.duration));
        const videoInformation = {
          mediaId: videoId,
          channelId: snippet.channelId,
          title: snippet.title,
          link: `https://youtu.be/${videoId}`,
          duration,
          thumb: snippet.thumbnails.default.url,
        };

        this.saveVideoInfoToCache(videoInformation, (err) => {
          if (err) {
            log.error({ err }, 'error saving video info to cache');
          }

          return cb(null, videoInformation);
        });
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async pause(roomName, socketId, cb) {
    log.debug({ roomName }, 'pause video');
    try {
      const room = await roomUtils.getRoomByName(roomName);
      const playlist = await PlayVideo.getPlaylistFromRoomName(roomName);

      if (!playlist) {
        log.warn('playlist does not exist');
        return cb('ERR_NO_MEDIA');
      }

      try {
        await PlayVideo.checkSocketPermission(socketId, room);
      } catch (err) {
        if (err instanceof PermissionError) {
          return cb(err);
        }

        return cb(errors.ERR_SRV);
      }

      if (!playlist.media.length) {
        log.warn('Attempt to pause when no media in playlist');
        return cb('ERR_NO_MEDIA');
      }

      const { startTime } = playlist.media[0];

      const pausedAt = new Date();
      const elapsedTimeDiff = pausedAt.getTime() - new Date(startTime).getTime();
      const elapsedDuration = Math.floor(elapsedTimeDiff / 1000);

      playlist.media[0].pausedAt = pausedAt;
      playlist.media[0].startTime = new Date(pausedAt.getTime() - (elapsedDuration * 1000));
      return playlist.save((err, newPlaylist) => {
        if (err) {
          log.fatal({ err }, 'failed to save room');
          return cb(err);
        }

        return cb(null, newPlaylist.media[0]);
      });
    } catch (err) {
      log.fatal({ err, roomName }, 'Error getting room');
      console.error({ err });
      return cb(err);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async resume(roomName, socketId, cb) {
    log.debug({ roomName }, 'resume video');
    let room;

    try {
      room = await roomUtils.getRoomByName(roomName);
    } catch (err) {
      log.fatal({ err }, 'error fetching room');
      return cb(errors.ERR_SRV);
    }

    try {
      await PlayVideo.checkSocketPermission(socketId, room);
    } catch (err) {
      if (err instanceof PermissionError) {
        return cb(err);
      }

      return cb(errors.ERR_SRV);
    }

    try {
      const playlist = await PlayVideo.getPlaylistFromRoomName(roomName);

      if (playlist.media.length === 0) {
        return cb('ERR_NO_MEDIA');
      }

      const {
        startTime,
        pausedAt,
        duration,
      } = playlist.media[0];

      // set the new endTime by calculating the duration played thus far
      // and subtracting that from the total video duration, which is
      // then used to add to the unpause time (current time)
      //
      // This is done as while the player is entirely on the client, the end time
      // must be set so that videos will play when a new user joins, or a user refreshes.
      const elapsedTimeDiff = new Date(pausedAt).getTime() - new Date(startTime).getTime();
      const elapsedDuration = Math.floor(elapsedTimeDiff / 1000);
      const currentTime = new Date().getTime();

      playlist.media[0].pausedAt = null;
      playlist.media[0].startTime = new Date(currentTime - (elapsedDuration * 1000));
      playlist.media[0].endTime = new Date(currentTime + ((duration - elapsedDuration) * 1000));

      return playlist.save((err, savedPlaylist) => {
        if (err) {
          log.fatal({ err }, 'failed to save room');
          return cb(err);
        }

        return cb(null, savedPlaylist.media[0]);
      });
    } catch (err) {
      log.fatal({ err, roomName }, 'Error getting room');
      return cb(err);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async seekTo(roomName, socketId, seekTime, cb) {
    let room;
    let playlist;
    let hasPermission;

    try {
      room = await roomUtils.getRoomByName(roomName);
    } catch (err) {
      log.fatal({ err, roomName }, 'failed to get room');
      return cb(err);
    }

    if (!room) {
      log.error({ roomName }, 'room does not exist');
      const err = new Error();
      err.name = 'NoRoomError';
      err.message = 'Room does not exist';
      return cb(err);
    }

    try {
      playlist = await PlayVideo.getPlaylistFromRoomName(roomName);
    } catch (err) {
      log.fatal({ err, roomName }, 'failed to get playlist');
      return cb(err);
    }

    try {
      await PlayVideo.checkSocketPermission(socketId, room);
    } catch (err) {
      if (err instanceof PermissionError) {
        return cb(err);
      }

      return cb(errors.ERR_SRV);
    }

    if (playlist.media.length === 0) {
      return cb('ERR_NO_MEDIA');
    }

    const {
      duration,
    } = playlist.media[0];

    const currentTime = new Date().getTime();

    playlist.media[0].startTime = new Date(currentTime - (seekTime * 1000));
    playlist.media[0].endTime = new Date(currentTime + ((duration - seekTime) * 1000));

    try {
      const savedPlaylist = await playlist.save();
      return cb(null, savedPlaylist.media[0], seekTime);
    } catch (err) {
      log.fatal({ err }, 'failed to save room');
      return cb(err);
    }
  }

  addToPlaylist(videoId, roomName, userId, cb) {
    return this.getVideoInformation(videoId, async (err, videoInformation) => {
      if (err) {
        log.error({ err }, 'Error getting video information');
        return cb(err);
      }

      try {
        const playlist = await PlayVideo.getPlaylistFromRoomName(roomName);

        const mediaObject = {
          ...videoInformation,
          mediaType: TYPE_YOUTUBE,
          startedBy: userId,
        };

        playlist.media = [
          ...playlist.media,
          mediaObject,
        ];

        return playlist.save((err, savedPlaylist) => {
          if (err) {
            log.fatal({ err }, 'error saving room');
            return cb(err);
          }

          return cb(null, savedPlaylist.media, videoInformation);
        });
      } catch (err) {
        log.fatal({ err }, 'error adding video to playlist');
        return cb(errors.ERR_SRV);
      }
    });
  }

  async removeFromPlaylist(id, roomName, cb) {
    try {
      const playlist = await PlayVideo.getPlaylistFromRoomName(roomName);
      const removedItem = playlist.media.find(m => String(m._id) === String(id));
      playlist.media = playlist.media.filter(m => String(m._id) !== String(id));

      playlist.save((err, savedPlaylist) => {
        if (err) {
          log.fatal({ err }, 'error saving playlist');
          return cb(errors.ERR_SRV);
        }

        return cb(null, removedItem, savedPlaylist.media.length);
      });
    } catch (err) {
      log.fatal({ err, roomName }, 'error fetching room');
      cb(errors.ERR_SRV);
    }
  }

  async startMedia(id, roomName, cb) {
    if (!id) {
      log.error('no ID supplied');
      return cb();
    }

    try {
      const playlist = await PlayVideo.getPlaylistFromRoomName(roomName);

      if (playlist.media.length === 0) {
        log.error('playlist empty');
        return cb();
      }

      let currentMedia = playlist.media.find(({ _id }) => String(_id) === String(id));

      if (!currentMedia) {
        log.error('media missing from playlist');
        return cb(errors.ERR_SRV);
      }

      currentMedia = currentMedia.toObject();

      const startTime = Date.now();
      playlist.media[0].startTime = startTime;
      playlist.media[0].endTime = new Date(startTime + (currentMedia.duration * 1000));
      playlist.media[0].startAt = PlayVideo.getStartTime({ ...currentMedia, startTime });

      playlist.save((err, savedPlaylist) => {
        if (err) {
          log.fatal({ err }, 'error saving playlist');
          return cb(errors.ERR_SRV);
        }

        return cb(null, savedPlaylist.media[0].toObject());
      });
    } catch (err) {
      log.fatal({ err, roomName }, 'error fetching room');
      cb(errors.ERR_SRV);
    }
  }

  async getMedia(roomName, id, cb) {
    try {
      const { media } = await PlayVideo.getPlaylistFromRoomName(roomName);

      if (media.length === 0) {
        return cb();
      }

      let selectedMedia;
      if (id) {
        selectedMedia = media.find(({ _id }) => String(_id) === String(id)).toObject();
      } else {
        selectedMedia = media[0].toObject();
      }

      return cb(null, {
        ...selectedMedia,
        startAt: PlayVideo.getStartTime(selectedMedia),
      });
    } catch (err) {
      log.fatal({ err, roomName }, 'error fetching room');
      return cb(errors.ERR_SRV);
    }
  }

  getCurrentMedia(roomName, cb) {
    this.getMedia(roomName, null, cb);
  }
}

module.exports.PlayVideo = PlayVideo;
module.exports.playVideo = new PlayVideo();
