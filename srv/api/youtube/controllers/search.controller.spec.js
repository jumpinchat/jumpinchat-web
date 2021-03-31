
/* global describe,it,beforeEach,after */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const log = require('../../../utils/logger.util')({ name: 'search.controller.spec' });

const sandbox = sinon.sandbox.create();

describe('youtube search controller', () => {
  let SearchYoutube;
  let searchYoutube;
  beforeEach(() => {
    SearchYoutube = proxyquire('./search.controller', {
      '../room.utils': {},
      '../../../lib/redis.util': () => ({ hmset: sinon.stub().yields() }),
      '../../../utils/utils': {
        encodeUriParams: () => 'foo',
      },
      './playVideo.controller': {
        saveVideoInfoToCache: sinon.stub().yields(),
      },
    });

    searchYoutube = new SearchYoutube();

    searchYoutube.redis = {
      get: sandbox.stub().yields(),
      set: sandbox.stub().yields(),
      expire: sandbox.stub().yields(),
    };
  });

  describe('fetchVideoIdFromUrl', () => {
    it('should extract ID from video URL', () => {
      expect(SearchYoutube.fetchVideoIdFromUrl('https://youtube.com/watch?v=dQw4w9WgXcQ'))
        .to.equal('dQw4w9WgXcQ');

      expect(SearchYoutube.fetchVideoIdFromUrl('https://youtu.be/dQw4w9WgXcQ'))
        .to.equal('dQw4w9WgXcQ');
    });

    it('should return query if no match', () => {
      expect(SearchYoutube.fetchVideoIdFromUrl('foo bar baz'))
        .to.equal('foo bar baz');
    });
  });

  describe('checkCache', () => {
    it('should get redis entry by hash', (done) => {
      searchYoutube.checkCache('foo', () => {
        expect(searchYoutube.redis.get.firstCall.args[0]).to.equal('yt_search:foo');
        done();
      });
    });
  });

  describe('saveSearchInCache', () => {
    it('should set json string in redis with has as key', (done) => {
      const hash = 'foo';
      const data = { foo: 'bar' };
      searchYoutube.saveSearchInCache(hash, data, () => {
        expect(searchYoutube.redis.set.firstCall.args[0]).to.equal(`yt_search:${hash}`);
        expect(searchYoutube.redis.set.firstCall.args[1]).to.equal('{"foo":"bar"}');
        done();
      });
    });

    it('should set cache entry to expire', (done) => {
      const hash = 'foo';
      const data = { foo: 'bar' };
      searchYoutube.saveSearchInCache(hash, data, () => {
        expect(searchYoutube.redis.expire.firstCall.args[0]).to.equal(`yt_search:${hash}`);
        expect(searchYoutube.redis.expire.firstCall.args[1]).to.equal(searchYoutube.cacheExpire);
        done();
      });
    });
  });

  describe('encodeUrlParams', () => {
    it('should create url params', () => {
      const params = SearchYoutube.encodeUrlParams({ foo: 'bar', bar: 'baz' });
      expect(params).to.equal('foo=bar&bar=baz');
    });
  });
});
