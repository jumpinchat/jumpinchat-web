import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RoomChatMessages from './RoomChatMessages.react';
import RoomChatInput from './RoomChatInput.react';
import ScrollArea from '../../elements/ScrollArea.react';
import {
  setScroll,
  setScrollFixed,
} from '../../../actions/ChatActions';

class RoomChatFeed extends Component {
  constructor(props) {
    super(props);
    this.feed = {};
    this.setScroll = setScroll;
    this.handleScroll = this.handleScroll.bind(this);
  }

  shouldComponentUpdate(prevProps) {
    const oldMessages = prevProps.messages.map(m => m.id).join('');
    const newMessages = this.props.messages.map(m => m.id).join('');
    const emojiPicker = this.props.emojiPickerOpen !== prevProps.emojiPickerOpen;
    const hasNewMessages = oldMessages !== newMessages;
    const isFixed = this.props.fixScroll !== prevProps.fixScroll;

    const newEmojiSearch = this.props.emojiSearch.results.reduce((acc, { id }) => `${acc}${id}`, '');
    const oldEmojiSearch = prevProps.emojiSearch.results.reduce((acc, { id }) => `${acc}${id}`, '');

    const emojiSearchSelected = this.props.emojiSearch.selected !== prevProps.emojiSearch.selected;

    if (hasNewMessages || emojiPicker || isFixed || emojiSearchSelected) {
      return true;
    }

    if (this.props.chatInputValue !== prevProps.chatInputValue) {
      return true;
    }

    if (newEmojiSearch !== oldEmojiSearch) {
      return true;
    }

    return false;
  }

  handleScroll(value) {
    const {
      topPosition,
      containerHeight,
      realHeight,
    } = value;
    const bottomDiff = realHeight - topPosition - containerHeight;

    if (!Number.isNaN(bottomDiff)) {
      this.setScroll(bottomDiff);
    }
  }

  render() {
    const {
      messages,
      roomName,
      users,
      currentUser,
      chatInputValue,
      emojiPickerOpen,
      fixScroll,
      emojiSearch,
      customEmoji,
      roomOwnerId,
    } = this.props;

    return (
      <div className="chat__FeedWrapper">
        <ScrollArea
          className="chat__Feed"
          contentStyle={{ paddingBottom: '0.25em' }}
          horizontal={false}
          onScroll={this.handleScroll}
        >
          <RoomChatMessages
            messages={messages}
            currentUser={currentUser}
            fixScroll={fixScroll}
            setScrollFixed={setScrollFixed}
          />
        </ScrollArea>
        <RoomChatInput
          room={roomName}
          roomOwnerId={roomOwnerId}
          users={users.map(u => ({ handle: u.handle, username: u.username }))}
          chatInputValue={chatInputValue}
          emojiPickerOpen={emojiPickerOpen}
          emojiSearch={emojiSearch}
          customEmoji={customEmoji}
        />
      </div>
    );
  }
}

RoomChatFeed.defaultProps = {
  messages: [],
  users: [],
  currentUser: null,
  chatInputValue: '',
  roomOwnerId: null,
};

RoomChatFeed.propTypes = {
  messages: PropTypes.array,
  roomName: PropTypes.string.isRequired,
  roomOwnerId: PropTypes.string,
  users: PropTypes.array,
  currentUser: PropTypes.object,
  chatInputValue: PropTypes.string,
  emojiPickerOpen: PropTypes.bool.isRequired,
  fixScroll: PropTypes.bool.isRequired,
  customEmoji: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RoomChatFeed;
