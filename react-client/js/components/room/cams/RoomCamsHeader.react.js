import React from 'react';
import PropTypes from 'prop-types';
import Clamp from 'react-clamp-lines';
import RoomBroadcastButton from './RoomBroadcastButton.react';
import RoomCamsLocalAudioActions from './RoomCamsLocalAudioActions.react';
import RoomRestrictions from '../RoomRestrictions.react';

const RoomCamsHeader = ({
  room,
  localStream,
  audioPtt,
  audioContext,
  localAudioActive,
  feedCount,
  userCount,
  canBroadcast,
  broadcastRestricted,
}) => (
  <div className="cams__Header">
    <div className="cams__RoomInfo">
      {room.settings.display && (
        <img
          className="cams__RoomDisplayPic mobileHidden"
          src={`https://s3.amazonaws.com/jic-uploads/${room.settings.display}`}
          alt={room.name}
        />
      )}
      <h2 className="cams__RoomName">{room.name}</h2>
      <div className="cams__InfoWrapper cams__StreamCountWrapper">
        <span className="cams__InfoCount cams__StreamCount">{feedCount}</span>
        <span className="cams__InfoLabel cams__StreamCountLabel">cams</span>
      </div>
      <div className="cams__InfoWrapper cams__ViewerCountWrapper">
        <span className="cams__InfoCount cams__ViewerCount">{userCount}</span>
        <span className="cams__InfoLabel cams__ViewerCountLabel">viewers</span>
      </div>
      <RoomRestrictions
        restrictions={{
          ageRestricted: room.attrs.ageRestricted,
          forceUser: room.settings.forceUser,
          requiresPassword: room.settings.requiresPassword,
          public: room.settings.public,
          requiresVerifiedEmail: room.settings.requiresVerifiedEmail,
        }}
      />
      {((room.settings.topic && room.settings.topic.text) || room.settings.description) && (
        <div
          className="cams__RoomDescriptionWrapper mobileHidden"
          title={(room.settings.topic && room.settings.topic.text) || room.settings.description}
        >
          <Clamp
            className="cams__RoomDescription"
            innerClassName="inner-card"
            text={(room.settings.topic && room.settings.topic.text) || room.settings.description}
            lines={2}
            buttons={false}
            ellipsis="&hellip;"
          />
        </div>
      )}
    </div>
    <div className="cams__HeaderActions">
      {(localStream && localStream.stream.getAudioTracks().length > 0) && (
        <RoomCamsLocalAudioActions
          audioPtt={audioPtt}
          localStream={localStream}
          audioContext={audioContext}
          localAudioActive={localAudioActive}
        />
      )}
      <RoomBroadcastButton
        localStream={localStream}
        canBroadcast={canBroadcast && !broadcastRestricted}
        feedCount={feedCount}
        roomName={room.name}
      />
    </div>
  </div>
);

RoomCamsHeader.defaultProps = {
  localStream: null,
  audioPtt: null,
  audioContext: null,
  localAudioActive: false,
};

RoomCamsHeader.propTypes = {
  room: PropTypes.shape({
    name: PropTypes.string.isRequired,
    attrs: PropTypes.shape({
      ageRestricted: PropTypes.bool,
    }).isRequired,
    settings: PropTypes.shape({
      display: PropTypes.string,
      forceUser: PropTypes.bool,
      requiresPassword: PropTypes.bool,
      requiresVerifiedEmail: PropTypes.bool,
      public: PropTypes.bool,
      topic: PropTypes.shape({
        text: PropTypes.string,
      }),
      description: PropTypes.string,
    }).isRequired,
  }).isRequired,
  localStream: PropTypes.shape({
    stream: PropTypes.object,
  }),
  audioPtt: PropTypes.bool,
  audioContext: PropTypes.object,
  localAudioActive: PropTypes.bool,
  feedCount: PropTypes.number.isRequired,
  userCount: PropTypes.number.isRequired,
  canBroadcast: PropTypes.bool.isRequired,
  broadcastRestricted: PropTypes.bool.isRequired,
};

export default RoomCamsHeader;
