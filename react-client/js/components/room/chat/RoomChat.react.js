/**
 * Created by Zaccary on 20/06/2015.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import RoomChatHeader from './RoomChatHeader.react';
import RoomUserList from './RoomUserList.react';
import RoomChatFeed from './RoomChatFeed.react';
import PmWrapper from './privateMessages/PmWrapper.react';
import withErrorBoundary from '../../../utils/withErrorBoundary';
import { chatTabs } from '../../../constants/RoomConstants';

export class RoomChat extends PureComponent {
  constructor() {
    super();
    this.state = {
      chatOpen: false,
    };

    this.handleOpenChat = this.handleOpenChat.bind(this);
  }

  handleOpenChat(chatOpen) {
    this.setState({
      chatOpen,
    });
  }

  render() {
    const {
      layout,
      messages,
      room,
      user,
      userList,
      optionOpen,
      camsDisabled,
      feedsCount,
      feedsMuted,
      showUserList,
      chatInputValue,
      settingsOptionsOpen,
      chatColors,
      playYoutubeVideos,
      chatTab,
      privateMessages,
      selectedConversation,
      pmMenuOpen,
      unreadConversations,
      emojiPickerOpen,
      ignoreList,
      scroll: {
        fixScroll,
      },
      emojiSearch,
      customEmoji,
      feedsHighDef,
      globalVolume,
    } = this.props;

    const { chatOpen } = this.state;

    return (
      <div
        className={classnames('chat', {
          'chat--open': chatOpen,
        })}
      >
        <RoomChatHeader
          room={room}
          feedsCount={feedsCount}
          camsDisabled={camsDisabled}
          feedsMuted={feedsMuted}
          showUserList={showUserList}
          settingsOptionsOpen={settingsOptionsOpen}
          user={user}
          chatColors={chatColors}
          playYoutubeVideos={playYoutubeVideos}
          chatTab={chatTab}
          onToggleChat={this.handleOpenChat}
          chatOpen={chatOpen}
          unreadConversations={unreadConversations}
          feedsHighDef={feedsHighDef}
          layout={layout}
          globalVolume={globalVolume}
        />
        <div className="chat__Body">
          {chatTab === chatTabs.CHAT_FEED && (
            <RoomChatFeed
              messages={messages}
              roomName={room.name}
              roomOwnerId={room.attrs.owner}
              users={userList}
              currentUser={user}
              chatInputValue={chatInputValue}
              emojiPickerOpen={emojiPickerOpen}
              fixScroll={fixScroll}
              emojiSearch={emojiSearch}
              customEmoji={customEmoji}
            />
          )}

          {chatTab === chatTabs.CHAT_PM && (
            <PmWrapper
              roomName={room.name}
              users={userList}
              currentUser={user}
              chatInputValue={chatInputValue}
              privateMessages={privateMessages}
              selectedConversation={selectedConversation}
              menuOpen={pmMenuOpen}
              fixScroll={fixScroll}
            />
          )}

          {chatTab === chatTabs.CHAT_FEED && (
            <RoomUserList
              room={room}
              users={userList}
              user={user}
              optionOpen={optionOpen}
              showUserList={showUserList}
              ignoreList={ignoreList}
            />
          )}
        </div>
      </div>
    );
  }
}

RoomChat.defaultProps = {
  messages: [],
  room: null,
  user: null,
  userList: [],
  optionOpen: null,
  camsDisabled: false,
  feedsCount: 0,
  feedsMuted: false,
  showUserList: true,
  chatInputValue: '',
  privateMessages: [],
  selectedConversation: null,
  pmMenuOpen: null,
  ignoreList: [],
};

RoomChat.propTypes = {
  room: PropTypes.object,
  messages: PropTypes.array,
  user: PropTypes.object,
  userList: PropTypes.array,
  optionOpen: PropTypes.string,
  camsDisabled: PropTypes.bool,
  feedsCount: PropTypes.number,
  feedsMuted: PropTypes.bool,
  showUserList: PropTypes.bool,
  chatInputValue: PropTypes.string,
  settingsOptionsOpen: PropTypes.bool.isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
  playYoutubeVideos: PropTypes.bool.isRequired,
  chatTab: PropTypes.string.isRequired,
  privateMessages: PropTypes.array,
  selectedConversation: PropTypes.string,
  pmMenuOpen: PropTypes.string,
  unreadConversations: PropTypes.number.isRequired,
  emojiPickerOpen: PropTypes.bool.isRequired,
  ignoreList: PropTypes.arrayOf(PropTypes.shape({
    userListId: PropTypes.string.isRequired,
    userId: PropTypes.string,
    createdAt: PropTypes.string,
  })),
  scroll: PropTypes.shape({
    fixScroll: PropTypes.bool.isRequired,
  }).isRequired,
  emojiSearch: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      colons: PropTypes.string,
    })),
    query: PropTypes.string,
    selected: PropTypes.number,
  }).isRequired,
  customEmoji: PropTypes.arrayOf(PropTypes.object).isRequired,
  feedsHighDef: PropTypes.bool.isRequired,
  layout: PropTypes.string.isRequired,
  globalVolume: PropTypes.number.isRequired,
};

export default withErrorBoundary(RoomChat);
