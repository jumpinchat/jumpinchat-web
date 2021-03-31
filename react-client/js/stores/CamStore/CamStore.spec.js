/* global window, describe, it, beforeEach */
import { expect } from 'chai';
import sinon from 'sinon';

import { CamStore } from './CamStore';

jest.mock('../../utils/localStorage');

describe('CamStore', () => {
  let camStore;
  beforeEach(() => {
    camStore = new CamStore();
  });

  describe('filterRemoteFeeds', () => {
    it('sould return only remote feeds', () => {
      camStore.state.feeds = [
        { userId: 'local' },
        { userId: '123' },
        { userId: '321' },
      ];

      expect(camStore.filterRemoteFeeds()).to.have.length(2);
    });
  });


  describe('setStreamCanBroadcast', () => {
    it('should set _canBroadcast', () => {
      camStore.state.canBroadcast = false;
      camStore.setStreamCanBroadcast(true);

      expect(camStore.state.canBroadcast).to.equal(true);
    });
  });

  describe('removeStream', () => {
    beforeEach(() => {
      camStore.state.cams = [
        {
          feedId: '123',
          userId: '098',
          stream: {},
        },
        {
          feedId: '321',
          userId: 'local',
          stream: {},
        },
      ];
      camStore.state.feeds = [
        {
          remoteFeed: {
            rfid: '123',
          },
        },
        {
          userId: 'local',
          remoteFeed: {
            rfid: '321',
          },
        },
      ];
    });

    it('should set cam stream object to null if user hidden', () => {
      camStore.removeStream('123', true);
      expect(camStore.state.cams[0].stream).to.equal(null);
    });

    it('should not alter feed if user hidden', () => {
      camStore.removeStream('123', true);
      expect(camStore.state.feeds[0])
        .to.eql({
          remoteFeed: {
            rfid: '123',
          },
        });
    });

    it('should remove cam if not user hidden', () => {
      camStore.removeStream('123', false);
      expect(camStore.state.cams).to.eql([{
        feedId: '321',
        userId: 'local',
        stream: {},
      }]);
    });

    it('should remove feed if not user hidden', () => {
      camStore.removeStream('123', false);
      expect(camStore.state.feeds).to.eql([{
        userId: 'local',
        remoteFeed: {
          rfid: '321',
        },
      }]);
    });

    it('should remove local cam if no rfid passed', () => {
      camStore.removeStream();
      expect(camStore.state.cams).to.eql([{
        feedId: '123',
        userId: '098',
        stream: {},
      }]);
    });

    it('should remove local feed if no rfid passed', () => {
      camStore.removeStream();
      expect(camStore.state.feeds).to.eql([{
        remoteFeed: {
          rfid: '123',
        },
      }]);
    });
  });

  describe('hangupStream', () => {
    beforeEach(() => {
      camStore.state.cams = [
        {
          feedId: '123',
          userId: '098',
          stream: {},
        },
        {
          feedId: '321',
          userId: 'local',
          stream: {},
        },
      ];
      camStore.state.feeds = [
        {
          userId: '098',
          remoteFeed: {
            rfid: '123',
            hangup: sinon.spy(),
            send: sinon.spy(),
          },
        },
        {
          userId: 'local',
          remoteFeed: {
            rfid: '321',
          },
        },
      ];
    });

    it('should set userClosed prop on feed', () => {
      camStore.hangupStream('098');
      expect(camStore.state.feeds[0]).to.have.property('userClosed');
      expect(camStore.state.feeds[0].userClosed).to.equal(true);
    });

    it('should call hangup on feed', () => {
      camStore.hangupStream('098');
      expect(camStore.state.feeds[0].remoteFeed.hangup.called).to.equal(true);
    });

    it('should remove the cam with user closed set to true', () => {
      camStore.removeStream = sinon.spy();
      camStore.hangupStream('098');
      expect(camStore.removeStream.firstCall.args).to.eql(['123', true]);
    });
  });

  describe('addStream', () => {
    let streamData;
    beforeEach(() => {
      streamData = {
        janusId: 'janusId',
        roomId: 'roomId',
        remoteFeed: {
          rfid: 'rfid',
          hangup: sinon.spy(),
          send: sinon.spy(),
        },
        userId: 'userId',
        token: 'token',
        userClosed: false,
        isLocal: false,
        stream: {
          getVideoTracks: sinon.stub().returns(['foo']),
        },
      };
    });

    it('should add local feed if no remoteFeed', () => {
      streamData = {
        ...streamData,
        remoteFeed: undefined,
      };
      camStore.addStream(streamData);
      expect(camStore.state.feeds).to.eql([{
        userId: 'local',
        video: true,
        audio: undefined,
      }]);
    });

    it('should add local cam if no remoteFeed', () => {
      streamData = {
        ...streamData,
        remoteFeed: undefined,
        isLocal: true,
      };
      camStore.addStream(streamData);
      expect(camStore.state.cams).to.eql([
        {
          janusId: 'janusId',
          userId: 'local',
          token: 'token',
          feedId: 'local',
          isLocal: true,
          stream: streamData.stream,
        },
      ]);
    });

    it('should update cam with new stream if feed exists', () => {
      camStore.addStream(streamData);

      streamData = { ...streamData, stream: { foo: 'bar' } };
      camStore.addStream(streamData);
      expect(camStore.state.cams[0].stream).to.eql({ foo: 'bar' });
    });

    it('should update feed with new remote feed if exists', () => {
      camStore.addStream(streamData);

      streamData = { ...streamData, remoteFeed: { ...streamData.remoteFeed, rfid: 'rfid2' } };
      camStore.addStream(streamData);
      expect(camStore.state.feeds[0].remoteFeed).to.eql({ ...streamData.remoteFeed, rfid: 'rfid2' });
    });

    it('should add new feed if it doesn\'t exist for user', () => {
      camStore.addStream(streamData);
      streamData = {
        ...streamData,
        userId: 'userId2',
        video: 'foo',
        audio: 'bar',
      };
      camStore.addStream(streamData);
      expect(camStore.state.feeds).to.eql([
        {
          remoteFeed: streamData.remoteFeed,
          userId: 'userId',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          volume: 100,
          loading: true,
          showVolume: false,
          video: undefined,
          audio: undefined,
          quality: 2,
        },
        {
          remoteFeed: streamData.remoteFeed,
          userId: 'userId2',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          volume: 100,
          loading: true,
          showVolume: false,
          video: 'foo',
          audio: 'bar',
          quality: 2,
        },
      ]);
    });

    it('should add a cam with a null stream if userClosed is true', () => {
      streamData = { ...streamData, userClosed: true };
      camStore.addStream(streamData);
      expect(camStore.state.cams).to.eql([{
        janusId: 'janusId',
        userId: 'userId',
        token: 'token',
        feedId: 'rfid',
        stream: null,
      }]);
    });

    it('should call hangup for userId if camsDisabled is true', () => {
      camStore.hangupStream = sinon.spy();
      camStore.state.camsDisabled = true;
      camStore.addStream(streamData);
      expect(camStore.hangupStream.firstCall.args).to.eql(['userId']);
    });

    it('should set loading to false if camsDisabled is true', () => {
      camStore.hangupStream = sinon.spy();
      camStore.state.feeds = [];
      camStore.state.camsDisabled = true;
      camStore.addStream(streamData);
      expect(camStore.state.feeds[0].loading).to.equal(false);
    });
  });

  describe('resumeStream', () => {
    it('should set resumed feed loading to true', () => {
      camStore.newRemoteFeed = sinon.spy();
      camStore.state.feeds = [
        {
          userId: 'userId',
          roomId: 'roomId',
          remoteFeed: { rfid: 'rfid' },
        },
      ];

      camStore.resumeStream('userId');
      expect(camStore.state.feeds[0].loading).to.equal(true);
    });

    it('should create a new remote feed from existing feed data', () => {
      camStore.newRemoteFeed = sinon.spy();
      camStore.state.feeds = [
        {
          userId: 'userId',
          roomId: 'roomId',
          remoteFeed: { rfid: 'rfid' },
          video: 'foo',
        },
      ];

      camStore.resumeStream('userId');
      expect(camStore.newRemoteFeed.firstCall.args).to.eql(['rfid', 'roomId', 'userId', 'foo']);
    });
  });

  describe('getCamFromFeed', () => {
    it('should get a cam by userId', () => {
      camStore.state.cams = [{ userId: 'userId' }];
      expect(camStore.getCamFromFeed('userId')).to.eql({ userId: 'userId' });
    });
  });

  describe('disableAllCams', () => {
    beforeEach(() => {
      camStore.state.cams = [{
        janusId: 'janusId',
        userId: 'userId',
        token: 'token',
        feedId: 'rfid',
        stream: {},
      }];

      camStore.state.feeds = [{
        remoteFeed: {
          rfid: 'rfid',
          hangup: sinon.spy(),
        },
        userId: 'userId',
        roomId: 'roomId',
        userClosed: false,
        optionsOpen: false,
        audioEnabled: true,
      }];
    });

    it('should get cams by feed userID', () => {
      camStore.getCamFromFeed = sinon.stub().returns({
        janusId: 'janusId',
        userId: 'userId',
        token: 'token',
        feedId: 'rfid',
        stream: {},
      });

      camStore.disableAllCams();
      expect(camStore.getCamFromFeed.callCount).to.equal(1);
    });

    it('should not hangup local stream', () => {
      camStore.state.feeds = camStore.state.feeds.map(f => ({ ...f, userId: 'local' }));
      camStore.hangupStream = sinon.spy();
      camStore.getCamFromFeed = sinon.stub().returns({
        janusId: 'janusId',
        userId: 'local',
        token: 'token',
        feedId: 'rfid',
        stream: {},
      });

      camStore.disableAllCams();
      expect(camStore.hangupStream.called).to.equal(false);
    });

    it('should not hangup remote if there is no stream', () => {
      camStore.hangupStream = sinon.spy();
      camStore.getCamFromFeed = sinon.stub().returns({
        janusId: 'janusId',
        userId: 'userId',
        token: 'token',
        feedId: 'rfid',
        stream: null,
      });

      camStore.disableAllCams();
      expect(camStore.hangupStream.called).to.equal(false);
    });

    it('should hangup remote streams', () => {
      camStore.hangupStream = sinon.spy();
      camStore.getCamFromFeed = sinon.stub().returns({
        janusId: 'janusId',
        userId: 'userId',
        token: 'token',
        feedId: 'rfid',
        stream: {},
      });
      camStore.state.feeds = [...camStore.state.feeds, { ...camStore.state.feeds[0], userId: 'userId2' }];

      camStore.disableAllCams();
      expect(camStore.hangupStream.callCount).to.equal(2);
    });
  });

  describe('enableAllCams', () => {
    beforeEach(() => {
      camStore.resumeStream = sinon.spy();
      camStore.getCamFromFeed = sinon.stub().returns({
        janusId: 'janusId',
        userId: 'userId',
        token: 'token',
        feedId: 'rfid',
        stream: null,
      });

      camStore.state.feeds = [
        {
          remoteFeed: {
            rfid: 'rfid',
            hangup: sinon.spy(),
          },
          userId: 'userId',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
        {
          userId: 'local',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
      ];
    });

    it('should resume all remote streams', () => {
      camStore.enableAllCams();
      expect(camStore.resumeStream.callCount).to.equal(1);
      expect(camStore.resumeStream.firstCall.args[0]).to.equal('userId');
    });
  });

  describe('muteRemoteStream', () => {
    beforeEach(() => {
      camStore.state.feeds = [
        {
          remoteFeed: {
            rfid: 'rfid',
            hangup: sinon.spy(),
          },
          userId: 'userId',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
        {
          remoteFeed: {
            rfid: 'rfid2',
            hangup: sinon.spy(),
          },
          userId: 'userId2',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: false,
        },
      ];
    });

    it('should set audioEnabled to false if currently true', () => {
      camStore.muteRemoteStream('userId');
      expect(camStore.state.feeds[0].audioEnabled).to.equal(false);
    });

    it('should set audioEnabled to true if currently false', () => {
      camStore.muteRemoteStream('userId2');
      expect(camStore.state.feeds[1].audioEnabled).to.equal(true);
    });
  });

  describe('muteAllRemoteStreams', () => {
    beforeEach(() => {
      camStore.state.feeds = [
        {
          remoteFeed: {
            rfid: 'rfid',
            hangup: sinon.spy(),
          },
          userId: 'userId',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
        {
          remoteFeed: {
            rfid: 'rfid2',
            hangup: sinon.spy(),
          },
          userId: 'userId2',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
      ];
    });

    it('should set volume for all feeds to 0', () => {
      camStore.muteAllRemoteStreams(true);
      expect(camStore.state.feeds.map(f => f.volume)).to.eql([0, 0]);
    });

    it('should set all feeds audioEnabled to true if they are currently false', () => {
      camStore.state.feeds = camStore.state.feeds.map(f => ({ ...f, volume: 0 }));
      camStore.muteAllRemoteStreams(false);
      expect(camStore.state.feeds.map(f => f.volume)).to.eql([100, 100]);
    });
  });

  describe('setStreamOptionsState', () => {
    beforeEach(() => {
      camStore.state.feeds = [
        {
          remoteFeed: {
            rfid: 'rfid',
            hangup: sinon.spy(),
          },
          userId: 'userId',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
        {
          remoteFeed: {
            rfid: 'rfid2',
            hangup: sinon.spy(),
          },
          userId: 'userId2',
          roomId: 'roomId',
          userClosed: false,
          optionsOpen: false,
          audioEnabled: true,
        },
      ];
    });

    it('should toggle feed option open state if no open param supplied', () => {
      camStore.setStreamOptionsState('userId');
      expect(camStore.state.feeds[0].optionsOpen).to.equal(true);
    });

    it('should set feed option open state to argument', () => {
      camStore.setStreamOptionsState('userId', 'foo');
      expect(camStore.state.feeds[0].optionsOpen).to.equal('foo');
    });

    it('should set other option states to false', () => {
      camStore.state.feeds[1].optionsOpen = true;
      camStore.setStreamOptionsState('userId', true);
      expect(camStore.state.feeds[1].optionsOpen).to.equal(false);
    });
  });

  describe('setCamsDisabled', () => {});

  describe('startTimeout', () => {
    it('should not set timeout if there are no remote feeds', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns([]);
      window.setTimeout = sinon.spy();

      camStore.startTimeout(1);
      expect(window.setTimeout.called).to.equal(false);
    });

    it('should set timeout if there are remote feeds', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      window.setTimeout = sinon.spy();

      camStore.startTimeout(1);

      expect(window.setTimeout.called).to.equal(true);
    });

    it('should set timeout to default if none is supplied', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.timeoutDuration = 10;
      window.setTimeout = sinon.spy();

      camStore.startTimeout();

      expect(window.setTimeout.firstCall.args[1]).to.equal(10);
    });

    it('should set timeout to supplied value if one is supplied', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      window.setTimeout = sinon.spy();

      camStore.startTimeout(20);

      expect(window.setTimeout.firstCall.args[1]).to.equal(20);
    });

    it('should not disable cams if user is broadcasting', () => {
      camStore.setCamsDisabled = sinon.spy();
      camStore.disableAllCams = sinon.spy();
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.state.isBroadcasting = true;
      window.setTimeout = sinon.spy();

      camStore.startTimeout(1);

      setTimeout(() => {
        expect(camStore.setCamsDisabled.called).to.equal(false);
      }, 2);
    });

    it('should disable cams if user is not broadcasting', () => {
      camStore.setCamsDisabled = sinon.spy();
      camStore.disableAllCams = sinon.spy();
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.state.isBroadcasting = true;
      window.setTimeout = sinon.spy();

      camStore.startTimeout(1);

      setTimeout(() => {
        expect(camStore.setCamsDisabled.called).to.equal(true);
      }, 2);
    });

    it('should send non-closing info notification', () => {
      camStore.setCamsDisabled = sinon.spy();
      camStore.disableAllCams = sinon.spy();
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.addNotification = sinon.spy();
      window.setTimeout = sinon.spy();

      camStore.startTimeout(1);

      setTimeout(() => {
        expect(camStore.addNotification.firstCall.args).to.equal({
          color: 'blue',
          message: 'Cams closed due to inactivity',
          autoClose: true,
        });
      }, 2);
    });
  });

  describe('resetTimeout', () => {
    it('should clear the timeout', () => {
      camStore.state.activeTimeout = 'foo';
      window.clearTimeout = sinon.spy();
      camStore.resetTimeout();
      expect(window.clearTimeout.firstCall.args[0]).to.equal('foo');
    });
  });

  describe('setIsBroadcasting', () => {
    beforeEach(() => {
      camStore.state.activeTimeout = 'foo';
      window.clearTimeout = sinon.spy();
    });

    it('should set broadcasting flag', () => {
      camStore.setIsBroadcasting(true);
      expect(camStore.state.isBroadcasting).to.equal(true);
    });

    it('should clear active timeout', () => {
      camStore.setIsBroadcasting(true);
      expect(window.clearTimeout.firstCall.args[0]).to.equal('foo');
    });

    it('should start timeout if user is not broadcasting', () => {
      camStore.setShouldRunTimeout = sinon.stub().returns('bar');
      camStore.setIsBroadcasting(false);
      expect(camStore.setShouldRunTimeout.called).to.equal(true);
    });

    it('should not start timeout if user is broadcasting', () => {
      camStore.startTimeout = sinon.spy();
      camStore.setIsBroadcasting(true);
      expect(camStore.startTimeout.called).to.equal(false);
    });
  });

  describe('setUserHasHandle', () => {
    it('should set has handle flag', () => {
      camStore.resetTimeout = sinon.stub();
      camStore.setUserHasHandle();
      expect(camStore.state.hasSetHandle).to.equal(true);
    });

    it('should reset the timeout', () => {
      camStore.resetTimeout = sinon.stub();
      camStore.setUserHasHandle();
      expect(camStore.resetTimeout.called).to.equal(true);
    });
  });

  describe('setSentMessage', () => {
    it('should reset timeout if user is not broadcasting', () => {
      camStore.resetTimeout = sinon.stub();
      camStore.state.isBroadcasting = false;
      camStore.setSentMessage();
      expect(camStore.resetTimeout.called).to.equal(true);
    });

    it('should not reset timeout if user is broadcasting', () => {
      camStore.resetTimeout = sinon.stub();
      camStore.state.isBroadcasting = true;
      camStore.setSentMessage();
      expect(camStore.resetTimeout.called).to.equal(false);
    });
  });

  describe('setShouldRunTimeout', () => {
    beforeEach(() => {
      camStore.state.activeTimeout = 'foo';
      window.clearTimeout = sinon.spy();
    });

    it('should clear existing timeout', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.state.activeTimeout = 'foo';
      window.clearTimeout = sinon.spy();
      camStore.setShouldRunTimeout();
      expect(window.clearTimeout.called).to.equal(true);
    });

    it('should start shorter timeout if there are remote feeds and no set handle', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.state.activeTimeout = 'foo';
      camStore.state.hasSetHandle = false;
      camStore.timeoutDurationNoHandle = 10;
      camStore.timeoutDuration = 20;
      camStore.startTimeout = sinon.spy();
      window.clearTimeout = sinon.spy();
      camStore.setShouldRunTimeout();
      expect(camStore.startTimeout.firstCall.args).to.eql([10]);
    });

    it('should start default timeout if there are remote feeds and set handle', () => {
      camStore.filterRemoteFeeds = sinon.stub().returns(['foo']);
      camStore.state.activeTimeout = 'foo';
      camStore.state.hasSetHandle = true;
      camStore.timeoutDurationNoHandle = 10;
      camStore.timeoutDuration = 20;
      camStore.startTimeout = sinon.spy();
      window.clearTimeout = sinon.spy();
      camStore.setShouldRunTimeout();
      expect(camStore.startTimeout.firstCall.args).to.eql([20]);
    });
  });

  describe('setFeedAudioActive', () => {
    it('should set audio active', () => {
      camStore.state.feeds = [{ remoteFeed: { rfid: 'foo' } }];
      camStore.setFeedAudioActive('foo', true);
      expect(camStore.state.feeds[0].audioActive).to.eql(true);
    });
  });

  describe('setFeedIsLoading', () => {
    it('should set a feed\'s loading state via user ID', () => {
      camStore.state.feeds = [{ loading: true, userId: 'foo' }];
      camStore.setFeedIsLoading('foo', false);
      expect(camStore.state.feeds[0].loading).to.equal(false);
    });
  });

  describe('setLocalAudioActive', () => {
    it('should set localAudioActive state', () => {
      camStore.state.localAudioActive = true;
      camStore.setLocalAudioActive(false);
      expect(camStore.state.localAudioActive).to.equal(false);
    });
  });

  describe('setReceiveSubstream', () => {
    it('should set allFeedsHd to false if setting to quality 0', () => {
      const feed = {
        userId: 'foo',
        remoteFeed: {
          send: sinon.spy(),
        },
        quality: 2,
      };

      camStore.state.allFeedsHd = true;
      camStore.state.feeds = [
        feed,
        {
          ...feed,
          userId: 'bar',
          quality: 2,
        },
      ];

      camStore.setReceiveSubstream('foo', 0);

      expect(camStore.state.allFeedsHd).to.equal(false);
    });

    it('should set allFeedsHd to true if setting to quality 2', () => {
      const feed = {
        userId: 'foo',
        remoteFeed: {
          send: sinon.spy(),
        },
        quality: 0,
      };

      camStore.state.allFeedsHd = false;
      camStore.state.feeds = [
        feed,
        {
          ...feed,
          userId: 'bar',
          quality: 2,
        },
      ];

      camStore.setReceiveSubstream('foo', 2);

      expect(camStore.state.allFeedsHd).to.equal(true);
    });
  });
});
