const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const { PermissionError } = require('../../../utils/error.util');
const config = require('../../../config/env');

const sandbox = sinon.sandbox.create();

describe('youtube play controller', () => {
  let playVideoController;
  let PlayVideo;
  let playVideo;
  let playlistSaveSpy;
  let playlistMock;
  let roomMock;

  const mediaItem = {
    mediaId: 'videoId',
    channelId: 'channelId',
    title: 'title',
    link: 'https://youtu.be/videoId',
    duration: 'P1S',
    thumb: 'https://example.com/foo.png',
  };

  beforeEach(() => {
    playlistMock = {
      room: 'foo',
      media: [
        {
          ...mediaItem,
          toObject: sinon.stub().returns({
            ...mediaItem,
            _id: '1',
          }),
        },
        {
          ...mediaItem,
          _id: '2',
          toObject: sinon.stub().returns({
            ...mediaItem,
            _id: '2',
          }),
        },
      ],
    };

    playlistSaveSpy = sinon.stub().yields(null, playlistMock);

    roomMock = {
      _id: 'foo',
    };

    playVideoController = proxyquire('./playVideo.controller', {
      '../../room/room.utils': {
        getRoomByName: sinon.stub().returns(Promise.resolve({
          ...roomMock,
        })),
        getMediaByRoomName: () => Promise.resolve(roomMock),
        getRoomIdFromName: () => Promise.resolve(),
      },
      '../../user/user.utils': {},
      '../../../lib/redis.util': () => ({ hmset: sinon.stub().yields() }),
      '../../../utils/encodeUriParams': () => 'foo',
      '../../role/role.utils': {
        getUserHasRolePermissions: () => Promise.resolve(true),
      },
      '../playlist.utils': {

        getMediaByRoomId: () => Promise.resolve({
          ...playlistMock,
          save: playlistSaveSpy,
        }),
      },
    });

    playVideo = playVideoController.playVideo;
    PlayVideo = playVideoController.PlayVideo;

    playVideo.redis = {
      get: sandbox.stub().yields(),
      set: sandbox.stub().yields(),
      expire: sandbox.stub().yields(),
    };

    playVideo.request = sinon.stub().yields(null, { statusCode: 200 }, {
      items: [{
        contentDetails: {
          duration: 'P1S',
        },
        snippet: {
          thumbnails: {
            default: {
              url: 'http://foo.bar',
            },
          },
        },
      }],
    });
  });

  describe('checkCache', () => {
    it('should get redis entry by hash', (done) => {
      playVideo.checkCache('foo', () => {
        expect(playVideo.redis.get.firstCall.args[0]).to.equal('yt:foo');
        done();
      });
    });
  });

  describe('saveVideoInfoToCache', () => {
    it('should set json string in redis with has as key', (done) => {
      const hash = 'foo';
      const data = {
        mediaId: 'foo',
      };
      playVideo.saveVideoInfoToCache(data, () => {
        expect(playVideo.redis.set.firstCall.args[0]).to.equal(`yt:${hash}`);
        expect(playVideo.redis.set.firstCall.args[1]).to.equal('{"mediaId":"foo"}');
        done();
      });
    });

    it('should set cache entry to expire', (done) => {
      const hash = 'foo';
      const data = {
        mediaId: 'foo',
      };
      playVideo.saveVideoInfoToCache(data, () => {
        expect(playVideo.redis.expire.firstCall.args[0]).to.equal(`yt:${hash}`);
        expect(playVideo.redis.expire.firstCall.args[1]).to.equal(config.yt.detailCacheExpire);
        done();
      });
    });
  });

  describe('getVideoInformation', () => {
    it('should not request YT API if cache is available', (done) => {
      playVideo.checkCache = sinon.stub().yields(null, '{"foo": "bar"}');
      playVideo.getVideoInformation('foo', () => {
        expect(playVideo.request.called).to.equal(false);
        done();
      });
    });

    it('should request YT API if cache is not available', (done) => {
      playVideo.checkCache = sinon.stub().yields(null);
      playVideo.getVideoInformation('foo', () => {
        expect(playVideo.request.called).to.equal(true);
        done();
      });
    });
  });

  describe('pause', () => {
    beforeEach(() => {
      PlayVideo.checkSocketPermission = sinon.stub().returns(true);
      playVideo = new PlayVideo();
    });

    it('should set pausedAt', (done) => {
      playVideo.pause('room', 'socket', () => {
        expect(playlistSaveSpy.called).to.equal(true);
        done();
      });
    });

    it('should return error if user doesnt have permissions', (done) => {
      PlayVideo.checkSocketPermission = sinon.stub().rejects(new PermissionError());
      playVideo = new PlayVideo();
      playVideo.pause('room', 'socket', (err) => {
        expect(err instanceof PermissionError).to.equal(true);
        done();
      });
    });
  });

  describe('resume', () => {
    beforeEach(() => {
      PlayVideo.checkSocketPermission = sinon.stub().resolves(true);
      playVideo = new PlayVideo();
    });

    it('should save room', (done) => {
      playVideo.resume('room', 'socket', () => {
        expect(playlistSaveSpy.called).to.equal(true);
        done();
      });
    });

    it('should return error if user doesnt have permissions', (done) => {
      PlayVideo.checkSocketPermission = sinon.stub().rejects(new PermissionError());
      playVideo = new PlayVideo();
      playVideo.resume('room', 'socket', (err) => {
        expect(err instanceof PermissionError).to.equal(true);
        done();
      });
    });
  });

  describe('getCurrentMedia', () => {
    it('should return the first item in the media array', (done) => {
      playVideo.getCurrentMedia('room', (err, media) => {
        if (err) {
          throw err;
        }

        expect(media._id).to.equal('1');
        done();
      });
    });

    it('should return add the startAt value', (done) => {
      PlayVideo.getStartTime = sinon.stub().returns('foo');
      playVideo = new PlayVideo();
      playVideo.getCurrentMedia('room', (err, media) => {
        expect(media.startAt).to.equal('foo');
        done();
      });
    });
  });
});
