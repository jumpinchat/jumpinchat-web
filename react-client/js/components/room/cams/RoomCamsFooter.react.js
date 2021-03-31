import React from 'react';
import PropTypes from 'prop-types';

import RoomChatShare from '../chat/RoomChatShare.react';
import RoomCamOptions from '../RoomCamOptions.react';

const RoomCamsFooter = ({
  user,
  roomName,
  feedsCount,
  camsDisabled,
  canPlayMedia,
  feedsHighDef,
  feedsMuted,
  settingsOptionsOpen,
  chatColors,
  playYoutubeVideos,
  modOnlyPlayMedia,
  layout,
  roomHasOwner,
  globalVolume,
}) => (
  <div className="chat__Header cams__Footer">
    <RoomChatShare roomName={roomName} />
    <RoomCamOptions
      user={user}
      roomName={roomName}
      feedsCount={feedsCount}
      camsDisabled={camsDisabled}
      canPlayMedia={canPlayMedia}
      feedsHighDef={feedsHighDef}
      feedsMuted={feedsMuted}
      settingsOptionsOpen={settingsOptionsOpen}
      chatColors={chatColors}
      playYoutubeVideos={playYoutubeVideos}
      modOnlyPlayMedia={modOnlyPlayMedia}
      layout={layout}
      roomHasOwner={roomHasOwner}
      globalVolume={globalVolume}
    />
  </div>
);

RoomCamsFooter.propTypes = {
  user: PropTypes.object.isRequired,
  roomName: PropTypes.string.isRequired,
  feedsCount: PropTypes.number.isRequired,
  feedsMuted: PropTypes.bool.isRequired,
  camsDisabled: PropTypes.bool.isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  playYoutubeVideos: PropTypes.bool.isRequired,
  feedsHighDef: PropTypes.bool.isRequired,
  settingsOptionsOpen: PropTypes.bool.isRequired,
  canPlayMedia: PropTypes.bool.isRequired,
  modOnlyPlayMedia: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  roomHasOwner: PropTypes.bool.isRequired,
  globalVolume: PropTypes.number.isRequired,
};

export default RoomCamsFooter;
