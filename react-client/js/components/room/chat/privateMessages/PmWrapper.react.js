import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PmConversationList from './PmConversationList.react';
import PmFeed from './PmFeed.react';
import {
  setChatInputValue,
} from '../../../../actions/ChatActions';
import {
  pmSelectConversation,
  openMenu,
  closeConversation,
  setConversationRead,
} from '../../../../actions/PmActions';
import { sendPrivateMessage } from '../../../../utils/RoomAPI';

class PmWrapper extends Component {
  constructor(props) {
    super(props);
    this.setChatInputValue = setChatInputValue;
    this.sendPrivateMessage = sendPrivateMessage;
    this.pmSelectConversation = pmSelectConversation;
    this.openMenu = openMenu;
    this.closeConversation = closeConversation;
    this.setConversationRead = setConversationRead;
    this.handleChange = this.handleChange.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleFocusInput = this.handleFocusInput.bind(this);
  }

  handleChange(e) {
    this.setChatInputValue(e.target.value);
  }

  handleSendMessage(e) {
    e.preventDefault();
    const {
      chatInputValue,
      roomName,
      selectedConversation,
    } = this.props;

    if (chatInputValue.length) {
      this.sendPrivateMessage(chatInputValue, roomName, selectedConversation);
      this.setChatInputValue('');
    }
  }

  handleClickOutside() {
    this.openMenu(null);
  }

  handleFocusInput(userListId) {
    this.setConversationRead(userListId);
  }

  render() {
    const {
      chatInputValue,
      selectedConversation,
      privateMessages,
      menuOpen,
      fixScroll,
    } = this.props;

    return (
      <div className="privateMessages__Wrapper">
        {privateMessages.length === 0 && (
          <div className="privateMessages__Empty">
            <span>No conversations yet</span>
          </div>
        )}

        {privateMessages.length > 0 && (
          <PmFeed
            privateMessages={privateMessages}
            chatInputValue={chatInputValue}
            onSubmit={this.handleSendMessage}
            onChange={this.handleChange}
            onFocus={this.handleFocusInput}
            selectedConversation={selectedConversation}
            fixScroll={fixScroll}
          />
        )}

        {privateMessages.length > 0 && (
          <PmConversationList
            privateMessages={privateMessages}
            selectConversation={this.pmSelectConversation}
            selectedConversation={selectedConversation}
            menuOpen={menuOpen}
            openMenu={this.openMenu}
            handleClickOutside={this.handleClickOutside}
            closeConversation={this.closeConversation}
          />
        )}
      </div>
    );
  }
}

PmWrapper.defaultProps = {
  chatInputValue: '',
  selectedConversation: null,
  menuOpen: null,
};

PmWrapper.propTypes = {
  selectedConversation: PropTypes.string,
  chatInputValue: PropTypes.string,
  privateMessages: PropTypes.arrayOf(PropTypes.shape({
    user: PropTypes.shape({
      userListId: PropTypes.string.isRequired,
      userId: PropTypes.string,
    }).isRequired,
    messages: PropTypes.array.isRequired,
    unreadMessages: PropTypes.number,
  })).isRequired,
  roomName: PropTypes.string.isRequired,
  menuOpen: PropTypes.string,
  fixScroll: PropTypes.bool.isRequired,
};

export default PmWrapper;
