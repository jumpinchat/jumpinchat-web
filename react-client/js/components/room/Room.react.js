/* global window */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import classnames from 'classnames';
import { connectToRoom } from '../../utils/RoomUtils';
import * as chatActions from '../../actions/ChatActions';
import { setSettingsModal } from '../../actions/AppActions';

import { StateContext } from '../../utils/withState';
import appStore from '../../stores/AppStore';
import roomStore from '../../stores/RoomStore';
import userStore from '../../stores/UserStore';
import modalStore from '../../stores/ModalStore';
import youtubeStore from '../../stores/YoutubeStore';
import chatStore from '../../stores/ChatStore/ChatStore';
import camStore from '../../stores/CamStore/CamStore';
import pmStore from '../../stores/PmStore/PmStore';
import profileStore from '../../stores/ProfileStore/ProfileStore';
import roleStore from '../../stores/RoleStore';
import RoomHeader from './RoomHeader.react';
import RoomCams from './cams/RoomCams.react';
import RoomChat from './chat/RoomChat.react';
import HandleModal from './HandleModal.react';
import BanListModal from './BanlistModal/BanlistModal.react';
import MediaSelectionModal from './MediaSelectionModal.react';
import YoutubeModal from './youtube/YoutubeModal.react';
import RoomInfoModal from './RoomInfoModal.react';
import ReportModal from './ReportModal/ReportModal.react';
import JoinConditionModal from './JoinConditionModal/JoinConditionModal.react';
import ProfileModal from './ProfileModal/ProfileModal.react';
import IgnoreListModal from './IgnoreList/IgnoreListModal.react';
import BanConfirmModal from './BanConfirmModal/BanConfirmModal.react';

import SettingsModal from '../settings/SettingsModal.react';

import NotificationContainer from '../notifications/NotificationContainer.react';
import { layouts } from '../../constants/RoomConstants';
import { requestWakeLock, releaseWakeLock } from '../../utils/wakelock';

function getDefaultState() {
  return {
    appState: appStore.getState(),
    room: roomStore.getRoom(),
    camState: camStore.getState(),
    chatState: chatStore.getState(),
    pmState: pmStore.getState(),
    userState: userStore.getState(),
    modalError: modalStore.getModalError(),
    handleModalState: modalStore.getHandleModal(),
    banlistModalState: modalStore.getBanlistModal(),
    infoModalState: modalStore.getInfoModal(),
    reportModal: modalStore.getReportModal(),
    banlist: modalStore.getBanlist(),
    profileState: profileStore.getState(),
    roleState: roleStore.getState(),

    mediaSelectionModal: modalStore.getMediaSelectionModal(),
    joinConditionModal: modalStore.getJoinConditionModal(),
    youtubeState: youtubeStore.getState(),
    profileModal: modalStore.getProfileModal(),
    ignoreListModal: modalStore.getIgnoreListModal(),
    banModal: modalStore.getBanModal(),
  };
}
class Room extends Component {
  static getFeedCount(feeds) {
    return feeds.filter(feed => feed.userId !== 'local').length;
  }

  constructor(props) {
    super(props);
    this.state = getDefaultState();
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.handleOpenSettings = this.handleOpenSettings.bind(this);
    this.setSettingsModal = setSettingsModal;
    this._onChange = this._onChange.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  componentWillMount() {
    connectToRoom(this.props);
  }

  async componentDidMount() {
    const { room } = this.props;
    appStore.addChangeListener(this._onChange);
    userStore.addChangeListener(this._onChange);
    roomStore.addChangeListener(this._onChange);
    chatStore.addChangeListener(this._onChange);
    camStore.addChangeListener(this._onChange);
    modalStore.addChangeListener(this._onChange);
    youtubeStore.addChangeListener(this._onChange);
    pmStore.addChangeListener(this._onChange);
    profileStore.addChangeListener(this._onChange);
    roleStore.addChangeListener(this._onChange);

    chatActions.setHistoricalMessages(room);

    window.onblur = () => chatActions.setWindowIsVisible(false);
    window.addEventListener('keydown', this.handleOpenSettings, false);

    try {
      this.wakeLock = await requestWakeLock();
    } catch (err) {
      console.error({ err }, 'failed to set wake lock');
    }

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  componentDidUpdate() {
    const { userState } = this.state;
    let darkTheme = false;
    if (userState.user) {
      ({ darkTheme } = userState.user.settings);
    }

    if (darkTheme) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  componentWillUnmount() {
    appStore.removeChangeListener(this._onChange);
    userStore.removeChangeListener(this._onChange);
    roomStore.removeChangeListener(this._onChange);
    chatStore.removeChangeListener(this._onChange);
    camStore.removeChangeListener(this._onChange);
    modalStore.removeChangeListener(this._onChange);
    youtubeStore.removeChangeListener(this._onChange);
    pmStore.removeChangeListener(this._onChange);
    roleStore.removeChangeListener(this._onChange);


    window.removeEventListener('keydown', this.handleOpenSettings);
    if (this.wakeLock) {
      releaseWakeLock();
    }
  }

  handleVisibilityChange() {
    if (this.wakeLock !== null && document.visibilityState === 'visible') {
      requestWakeLock();
    }
  }

  _getState() {
    const state = getDefaultState();
    this.setState(state);
    if (process.env.NODE_ENV !== 'production') {
      window.state = state;
    }
  }

  _onChange() {
    this._getState();
  }

  handleOpenSettings(e) {
    if (e.ctrlKey && e.key === ',') {
      this.setSettingsModal(true);
    }
  }

  handleWindowClick() {
    const { userListOptionOpen } = this.state;
    if (userListOptionOpen) {
      chatActions.setUserListOption(null);
    }

    chatActions.setWindowIsVisible(true);
  }

  render() {
    const {
      appState,
      room,
      userState,
      chatState,
      camState,
      youtubeState,
      pmState,
      profileState,
      profileModal,
      handleModalState,
      modalError,
    } = this.state;

    if (!room) {
      return null;
    }

    const roomTitle = chatState.unreadMessages > 0
      ? `(${chatState.unreadMessages}) ${room.name} | JumpInChat`
      : `${room.name} | JumpInChat`;

    return (
      <StateContext.Provider value={this.state}>
        <div
          className={classnames('room', {
            'layout--horizontal': appState.layout === layouts.HORIZONTAL,
          })}
          onClick={this.handleWindowClick}
        >
          <Helmet>
            <title>{roomTitle}</title>
          </Helmet>
          <RoomHeader
            room={room}
            user={userState.user}
            userIsLoggedIn={!!userState.user.user_id}
            accountDropdownTitle={userState.accountDropdownTitle}
            unreadMessages={userState.unreadMessages}
            ref={(e) => { this.header = e; }}
          />

          <RoomCams
            layout={appState.layout}
            room={room}
            userCount={chatState.users.length}
            feeds={camState.feeds}
            cams={camState.cams}
            localStream={camState.localStream}
            canBroadcast={camState.canBroadcast}
            user={userState.user}
            users={chatState.users}
            currentlyPlaying={youtubeState.currentlyPlaying}
            ytOptionsOpen={youtubeState.optionsOpen}
            ytVolume={youtubeState.volume}
            audioPtt={camState.audioPtt}
            audioContext={camState.audioContext}
            playYoutubeVideos={youtubeState.playVideos}
            localAudioActive={camState.localAudioActive}
            showYoutubeVolume={youtubeState.showVolumeControl}
            broadcastRestricted={userState.broadcastRestricted}
            feedsHighDef={camState.allFeedsHd}
            camsDisabled={camState.camsDisabled}
            feedsMuted={camState.allFeedsMuted}
            settingsOptionsOpen={chatState.settingsOptionsOpen}
            chatColors={chatState.chatColors}
            globalVolume={camState.globalVolume}
          />

          <RoomChat
            layout={appState.layout}
            messages={chatState.messages}
            room={room}
            user={userState.user}
            userList={chatState.users}
            optionOpen={chatState.userListOptionOpen}
            camsDisabled={camState.camsDisabled}
            feedsCount={Room.getFeedCount(camState.feeds)}
            feedsMuted={camState.allFeedsMuted}
            showUserList={chatState.showUserList}
            chatInputValue={chatState.chatInputValue}
            settingsOptionsOpen={chatState.settingsOptionsOpen}
            chatColors={chatState.chatColors}
            playYoutubeVideos={youtubeState.playVideos}
            chatTab={chatState.chatTab}
            privateMessages={pmState.privateMessages}
            selectedConversation={pmState.selectedConversation}
            pmMenuOpen={pmState.menuOpen}
            unreadConversations={pmState.unreadConversations}
            emojiPickerOpen={chatState.emojiPickerOpen}
            ignoreList={chatState.ignoreList}
            scroll={chatState.scroll}
            emojiSearch={chatState.emojiSearch}
            customEmoji={chatState.emoji}
            feedsHighDef={camState.allFeedsHd}
            globalVolume={camState.globalVolume}
          />

          <NotificationContainer />

          <HandleModal
            isOpen={handleModalState}
            error={modalError}
            user={userState.user}
          />

          <BanListModal
            isOpen={this.state.banlistModalState}
            banlist={this.state.banlist}
            user={userState.user}
            error={this.state.modalError}
          />

          <MediaSelectionModal
            modal={this.state.mediaSelectionModal}
            error={this.state.modalError}
            forcePtt={this.state.room.settings.forcePtt}
            isGold={this.state.userState.user.isGold}
            videoQuality={this.state.userState.user.videoQuality}
            qualityOptions={camState.qualityOptions}
            audioPtt={camState.audioPtt}
          />

          <YoutubeModal
            isOpen={this.state.youtubeState.searchModalOpen}
            results={this.state.youtubeState.searchResults}
            error={this.state.modalError}
            resultsLoading={this.state.youtubeState.resultsLoading}
            playlist={this.state.youtubeState.playlist}
          />

          {
            this.state.room.attrs.fresh
            && this.state.room.attrs.owner
            && this.state.room.attrs.owner === this.state.userState.user.user_id && (
              <RoomInfoModal
                isOpen={this.state.infoModalState}
                roomId={this.state.room._id}
              />
            )
          }

          {this.state.userState.user._id && (
            <ReportModal
              isOpen={this.state.reportModal.open}
              room={this.state.room.name}
              reporterId={this.state.userState.user._id}
              targetId={this.state.reportModal.targetId}
              messages={chatState.messages}
            />
          )}

          <JoinConditionModal
            isOpen={!!this.state.joinConditionModal.error}
            error={this.state.joinConditionModal.error}
            room={this.props.room}
            body={this.state.joinConditionModal.body}
          />

          <ProfileModal
            loading={profileState.loading}
            profile={profileState.profile}
            open={profileModal}
            user={userState.user}
            roomOwner={room.attrs.owner}
            ignoreListItem={chatStore.getIgnoreItemByUserId(profileState.profile.userListId)}
          />

          <IgnoreListModal
            isOpen={this.state.ignoreListModal.open}
            ignoreList={this.state.chatState.ignoreList}
          />

          <BanConfirmModal
            {...this.state.banModal}
            error={this.state.modalError}
          />

          <SettingsModal
            isOpen={appState.settingsOpen}
          />
        </div>
      </StateContext.Provider>
    );
  }
}

Room.defaultProps = {
  room: null,
  user: null,
  activityToken: null,
};

Room.propTypes = {
  room: PropTypes.string,
  user: PropTypes.object,
  activityToken: PropTypes.string,
};

export default Room;
