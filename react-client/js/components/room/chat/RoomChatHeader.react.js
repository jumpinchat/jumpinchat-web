import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import RoomCamOptions from '../RoomCamOptions.react';
import {
  setRoomMessageSounds,
  setUserlist,
  setSettingsMenu,
  selectChatTab,
} from '../../../actions/ChatActions';

import {
  resumeAllRemoteStreams,
  hangupAllRemoteStreams,
  toggleMuteAllRemoteStreams,
  setQuality,
} from '../../../actions/CamActions';

import { chatTabs, layouts } from '../../../constants/RoomConstants';

import RoomChatShare from './RoomChatShare.react';

export class RoomChatHeader extends Component {
  constructor(props) {
    super(props);

    this.resumeAllRemoteStreams = resumeAllRemoteStreams;
    this.hangupAllRemoteStreams = hangupAllRemoteStreams;
    this.toggleMuteAllRemoteStreams = toggleMuteAllRemoteStreams;
    this.setRoomMessageSounds = setRoomMessageSounds;
    this.setUserlist = setUserlist;
    this.setSettingsMenu = setSettingsMenu;
    this.selectChatTab = selectChatTab;
    this.setQuality = setQuality;

    this.onMessageSoundChange = this.onMessageSoundChange.bind(this);
    this.onToggleUserlist = this.onToggleUserlist.bind(this);
    this.selectFeedTab = this.selectFeedTab.bind(this);
    this.selectPrivateMessageTab = this.selectPrivateMessageTab.bind(this);
    this.selectUserListTab = this.selectUserListTab.bind(this);
  }

  onToggleAllStreams() {
    const { camsDisabled } = this.props;
    if (camsDisabled) {
      this.resumeAllRemoteStreams();
    } else {
      this.hangupAllRemoteStreams();
    }
  }

  onMessageSoundChange() {
    const { messageSounds } = this.props;
    this.setRoomMessageSounds(!messageSounds);
  }

  onToggleUserlist() {
    const { showUserList } = this.props;
    this.setUserlist(!showUserList);
  }

  selectFeedTab() {
    this.selectChatTab(chatTabs.CHAT_FEED);
  }

  selectPrivateMessageTab() {
    this.selectChatTab(chatTabs.CHAT_PM);
  }

  selectUserListTab() {
    this.selectChatTab(chatTabs.CHAT_USER_LIST);
  }

  render() {
    const {
      room,
      feedsCount,
      camsDisabled,
      feedsMuted,
      chatColors,
      user,
      playYoutubeVideos,
      chatTab,
      onToggleChat,
      chatOpen,
      unreadConversations,
      feedsHighDef,
      layout,
      settingsOptionsOpen,
      showUserList,
      globalVolume,
    } = this.props;

    return (
      <div className="chat__Header">
        <div className="chat__HeaderMessageTabs">
          <label
            className="button chat__HeaderOption chat__HeaderOption-toggleChat"
            title="Toggle chat feed"
          >
            <span
              className={classnames('fa', {
                'fa-chevron-down': chatOpen,
                'fa-chevron-up': !chatOpen,
              })}
              aria-hidden="true"
            />
            <input
              type="checkbox"
              className="jic-checkbox"
              checked={chatOpen}
              onChange={() => onToggleChat(!chatOpen)}
            />
          </label>
          <button
            type="button"
            className={classnames('button', 'tabs__Item', {
              active: chatTab === chatTabs.CHAT_FEED,
            })}
            onClick={this.selectFeedTab}
          >
            Chat
          </button>
          <button
            type="button"
            className={classnames('button', 'tabs__Item', {
              active: chatTab === chatTabs.CHAT_PM,
            })}
            onClick={this.selectPrivateMessageTab}
          >
            PMs
            {unreadConversations > 0 && (
              <Fragment>
                &nbsp;
                <span
                  className={classnames('pill', 'pill--blue', 'pill--animated')}
                >
                  {unreadConversations}
                </span>
              </Fragment>
            )}
          </button>
          {layout === layouts.VERTICAL && (
            <RoomChatShare roomName={room.name} />
          )}
        </div>

        <div className="chat__HeaderOptions">
          {layout === layouts.VERTICAL && (
            <RoomCamOptions
              user={user}
              roomName={room.name}
              feedsCount={feedsCount}
              camsDisabled={camsDisabled}
              feedsHighDef={feedsHighDef}
              feedsMuted={feedsMuted}
              settingsOptionsOpen={settingsOptionsOpen}
              chatColors={chatColors}
              playYoutubeVideos={playYoutubeVideos}
              modOnlyPlayMedia={room.settings.modOnlyPlayMedia}
              roomHasOwner={Boolean(room.attrs.owner)}
              layout={layout}
              globalVolume={globalVolume}
            />
          )}

          <button
            type="button"
            className={classnames('button chat__HeaderOption', 'chat__HeaderOption--toggleUserlist', {
              'button-blue': showUserList,
            })}
            onClick={this.onToggleUserlist}
          >
            <i className="fa fa-list-ul" />
          </button>
        </div>
      </div>
    );
  }
}


RoomChatHeader.defaultProps = {
  room: null,
  messageSounds: true,
  feedsCount: 0,
  camsDisabled: false,
  feedsMuted: false,
  showUserList: true,
  user: null,
  settingsOptionsOpen: false,
};

RoomChatHeader.propTypes = {
  room: PropTypes.object,
  messageSounds: PropTypes.bool,
  feedsCount: PropTypes.number,
  camsDisabled: PropTypes.bool,
  feedsMuted: PropTypes.bool,
  showUserList: PropTypes.bool,
  user: PropTypes.object,
  settingsOptionsOpen: PropTypes.bool,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  playYoutubeVideos: PropTypes.bool.isRequired,
  chatTab: PropTypes.string.isRequired,
  onToggleChat: PropTypes.func.isRequired,
  chatOpen: PropTypes.bool.isRequired,
  unreadConversations: PropTypes.number.isRequired,
  feedsHighDef: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  globalVolume: PropTypes.number.isRequired,
};

export default RoomChatHeader;
