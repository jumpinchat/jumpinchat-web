const Joi = require('joi');
const request = require('request');
const crypto = require('crypto');
const {
  toSeconds,
  parse,
} = require('iso8601-duration');
const log = require('../../../utils/logger.util')({ name: 'searchYoutube.controller' });
const config = require('../../../config/env');
const errors = require('../../../config/constants/errors');
const redis = require('../../../lib/redis.util')();
const { playVideo } = require('./playVideo.controller');
const ytApiQuery = require('../utils/ytApiQuery');
const getCurrentCred = require('../utils/getCurrentCred');

const youtubeIdRe = /^[a-zA-Z0-9_-]{11}$/;
class SearchYoutube {
  static fetchVideoIdFromUrl(query) {
    const urlRe = /^(?:https?:\/\/)?(?:www.)?(?:youtu\.be|youtube\.com\/watch)(?:\?v=|\/)([a-zA-Z0-9_-]{11})(.*)?/;
    return query.replace(urlRe, '$1');
  }

  static testYouTubeId(id) {
    return youtubeIdRe.test(id);
  }

  static createSha(query) {
    return crypto.createHash('sha256').update(query).digest('base64');
  }

  constructor() {
    this.Joi = Joi;
    this.request = request;
    this.redis = redis;
    this.cacheExpire = config.yt.cacheExpire;
  }

  validate(data, cb) {
    const schema = this.Joi.object().keys({
      term: this.Joi.string().required(),
    });

    this.Joi.validate(data, schema, cb);
  }

  checkCache(hash, cb) {
    this.redis.get(`yt_search:${hash}`, cb);
  }

  saveSearchInCache(hash, results, cb) {
    let resultsString;
    try {
      resultsString = JSON.stringify(results);
    } catch (e) {
      return cb(e);
    }

    const key = `yt_search:${hash}`;

    return this.redis.set(key, resultsString, (err) => {
      if (err) {
        return cb(err);
      }

      return this.redis.expire(key, this.cacheExpire, cb);
    });
  }

  static encodeUrlParams(params) {
    return Object.keys(params)
      .map(val => `${val}=${encodeURIComponent(params[val])}`)
      .join('&');
  }

  sendRequest(req, res) {
    this.validate(req.params, (err, params) => {
      if (err) {
        log.warn({ err }, 'invalid search params');
        return res.status(400).send({
          message: 'invalid search term',
        });
      }

      const term = SearchYoutube.fetchVideoIdFromUrl(params.term);

      if (!term || !SearchYoutube.testYouTubeId(term)) {
        return res.status(400).send({
          message: 'Not a video URL or ID',
        });
      }

      this.checkCache(term, async (err, cache) => {
        if (err) {
          log.fatal({ err }, 'failed to check cache');
          return res.status(403).send(errors.ERR_SRV);
        }

        if (cache) {
          log.debug({ term }, 'results cached, returning existing result');
          return res.status(200).send(JSON.parse(cache));
        }

        if (!cache) {
          log.debug({ term }, 'no cached results, creating new cache entry');
          const urlParams = {
            part: 'contentDetails,snippet',
            id: term,
            fields: 'items(id,snippet(channelId,title,thumbnails),contentDetails(duration))',
          };

          const url = 'https://www.googleapis.com/youtube/v3/videos';

          let items;
          try {
            items = await ytApiQuery(url, urlParams);
          } catch (err) {
            if (err.name === 'ExternalProviderError') {
              await getCurrentCred({ hasExpired: true });

              return this.sendRequest(req, res);

              // return res.status(500).send({
              //   code: 'ExternalProviderError',
              //   message: 'YouTube quota exceeded. Quota will be reset at midnight PST',
              // });
            }

            return res.status(500).send(errors.ERR_SRV);
          }

          if (items.length === 0) {
            return this.saveSearchInCache(term, [], (err) => {
              if (err) {
                log.fatal({ err }, 'error saving cache');
                return res.status(403).send(errors.ERR_SRV);
              }

              return res.status(200).send([]);
            });
          }

          const {
            contentDetails,
            snippet,
          } = items[0];
          const duration = toSeconds(parse(contentDetails.duration));
          const videoInformation = {
            mediaId: term,
            channelId: snippet.channelId,
            title: snippet.title,
            link: `https://youtu.be/${term}`,
            duration,
            thumb: snippet.thumbnails.default.url,
          };

          const responseData = items.map(result => ({
            title: result.snippet.title,
            videoId: result.id,
            thumb: result.snippet.thumbnails.medium,
            channelId: result.snippet.channelId,
            urls: {
              video: `https://youtu.be/${result.id}`,
              channel: `https://youtube.com/channel/${result.snippet.channelId}`,
            },
          }));

          playVideo.saveVideoInfoToCache(videoInformation, (err) => {
            if (err) {
              log.fatal({ err }, 'error saving cache');
            } else {
              log.info('video information saved to cache');
            }
          });

          return this.saveSearchInCache(term, responseData, (err) => {
            if (err) {
              log.fatal({ err }, 'error saving cache');
              return res.status(403).send(errors.ERR_SRV);
            }

            return res.status(200).send(responseData);
          });
        }
      });
    });
  }
}

module.exports = SearchYoutube;
