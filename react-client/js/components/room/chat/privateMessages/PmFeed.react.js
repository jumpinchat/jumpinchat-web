import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PmInput from './PmInput.react';
import RoomChatMessages from '../RoomChatMessages.react';
import ScrollArea from '../../../elements/ScrollArea.react';
import {
  setScroll,
  setScrollFixed,
} from '../../../../actions/ChatActions';

class PmFeed extends Component {
  constructor(props) {
    super(props);
    this.setScroll = setScroll;
    this.handleScroll = this.handleScroll.bind(this);
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
      privateMessages,
      chatInputValue,
      selectedConversation,
      onSubmit,
      onChange,
      onFocus,
      fixScroll,
    } = this.props;

    const selectedConversationMessages = privateMessages
      .find(m => m.user.userListId === selectedConversation);

    return (
      <div className="chat__FeedWrapper">
        <ScrollArea
          className="chat__Feed"
          contentStyle={{ paddingBottom: '0.25em' }}
          onScroll={this.handleScroll}
          horizontal={false}
        >
          {selectedConversationMessages && (
            <RoomChatMessages
              messages={selectedConversationMessages.messages}
              fixScroll={fixScroll}
              setScrollFixed={setScrollFixed}
            />
          )}
        </ScrollArea>
        {!!selectedConversation && !!selectedConversationMessages && (
          <PmInput
            onSendMessage={onSubmit}
            onChange={onChange}
            onFocus={onFocus}
            value={chatInputValue}
            disabled={selectedConversationMessages.disabled}
            participant={selectedConversationMessages.user}
          />
        )}
      </div>
    );
  }
}

PmFeed.defaultProps = {
  chatInputValue: '',
  selectedConversation: null,
};

PmFeed.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  privateMessages: PropTypes.arrayOf(PropTypes.shape({
    user: PropTypes.shape({
      userListId: PropTypes.string.isRequired,
      userId: PropTypes.string,
    }).isRequired,
    messages: PropTypes.array.isRequired,
  })).isRequired,
  chatInputValue: PropTypes.string,
  selectedConversation: PropTypes.string,
  fixScroll: PropTypes.bool.isRequired,
};

export default PmFeed;
