import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RoomChatSettingsMenu from './chat/RoomChatSettingsMenu.react';
import { selectChatTab } from '../../actions/ChatActions';
import { withState } from '../../utils/withState';
import { setSettingsModal } from '../../actions/AppActions';
import {
  resumeAllRemoteStreams,
  hangupAllRemoteStreams,
  toggleMuteAllRemoteStreams,
  setGlobalStreamVolume,
} from '../../actions/CamActions';

import { setYoutubeSearchModal } from '../../actions/YoutubeActions';
import RoomCamsAudioControl from './cams/RoomCamsAudioControl.react';

export class RoomCamOptions extends PureComponent {
  constructor() {
    super();
    this.setSettingsModal = setSettingsModal;
    this.selectChatTab = selectChatTab;
    this.resumeAllRemoteStreams = resumeAllRemoteStreams;
    this.hangupAllRemoteStreams = hangupAllRemoteStreams;
    this.toggleMuteAllRemoteStreams = toggleMuteAllRemoteStreams;
    this.setYoutubeSearchModal = setYoutubeSearchModal;
    this.setGlobalStreamVolume = setGlobalStreamVolume;

    this.onToggleAllStreams = this.onToggleAllStreams.bind(this);
    this.onToggleSettings = this.onToggleSettings.bind(this);
    this.onToggleAllStreamAudio = this.onToggleAllStreamAudio.bind(this);
    this.handleOpenVideoModal = this.handleOpenVideoModal.bind(this);
  }

  onToggleAllStreams() {
    const { camsDisabled } = this.props;
    if (camsDisabled) {
      this.resumeAllRemoteStreams();
    } else {
      this.hangupAllRemoteStreams();
    }
  }


  onToggleAllStreamAudio() {
    const { feedsMuted } = this.props;
    this.toggleMuteAllRemoteStreams(!feedsMuted);
  }

  onToggleSettings(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setSettingsModal(true);
  }

  handleOpenVideoModal() {
    this.setYoutubeSearchModal(true);
  }

  render() {
    const {
      user,
      roomName,
      feedsCount,
      camsDisabled,
      settingsOptionsOpen,
      chatColors,
      playYoutubeVideos,
      modOnlyPlayMedia,
      layout,
      roomHasOwner,
      globalVolume,
      roleState: { roles },
    } = this.props;

    const hasMediaPermissions = roles
      .filter(role => user.roles.includes(role.tag))
      .some(role => role.permissions.playMedia);

    const canPlayMedia = hasMediaPermissions && roomHasOwner;

    return (
      <Fragment>
        <div className="chat__HeaderOptions">
          {feedsCount > 0 && (
            <button
              type="button"
              className={
                classnames(
                  'button',
                  'button-floating',
                  { 'button-white': camsDisabled },
                  { 'button-blue': !camsDisabled },
                  'chat__HeaderOption',
                  'chat__HeaderOption--spaced',
                  'chat__ToggleCams',
                )
              }
              onClick={this.onToggleAllStreams}
            >
              <i className="fa fa-video-camera" />
              &nbsp;
              <span className="chat__HeaderOptionString">
                {camsDisabled ? 'Resume cams' : 'Hide cams'}
              </span>
            </button>
          )}

          {canPlayMedia && (
            <button
              type="button"
              className="button button-floating button-blue chat__HeaderOption chat__HeaderOption--spaced chat__HeaderOption--video"
              onClick={this.handleOpenVideoModal}
            >
              <FontAwesomeIcon
                icon={['far', 'film']}
              />
              &nbsp;
              <span className="chat__HeaderOptionString">
                Play videos
              </span>
            </button>
          )}
          <RoomChatSettingsMenu
            user={user}
            open={settingsOptionsOpen}
            onClick={this.onToggleSettings}
            chatColors={chatColors}
            activeColor={user.color}
            playYoutubeVideos={playYoutubeVideos}
            modOnlyPlayMedia={modOnlyPlayMedia}
            darkTheme={user.settings.darkTheme}
            roomName={roomName}
            layout={layout}
          />

          <RoomCamsAudioControl
            onChange={this.setGlobalStreamVolume}
            volume={globalVolume}
          />
        </div>
      </Fragment>
    );
  }
}

RoomCamOptions.propTypes = {
  user: PropTypes.object.isRequired,
  roomName: PropTypes.string.isRequired,
  feedsCount: PropTypes.number.isRequired,
  feedsMuted: PropTypes.bool.isRequired,
  camsDisabled: PropTypes.bool.isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  playYoutubeVideos: PropTypes.bool.isRequired,
  settingsOptionsOpen: PropTypes.bool.isRequired,
  modOnlyPlayMedia: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  roomHasOwner: PropTypes.bool.isRequired,
  globalVolume: PropTypes.number.isRequired,
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      permissions: PropTypes.objectOf(PropTypes.bool),
    })),
  }).isRequired,
};

export default withState(RoomCamOptions);
