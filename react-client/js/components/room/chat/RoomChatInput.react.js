import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emojiIndex } from 'emoji-mart';
import TetherComponent from 'react-tether';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { withState } from '../../../utils/withState';
import EmojiPicker from './EmojiPicker/EmojiPicker.react';
import EmojiPredict from './EmojiPicker/EmojiPredict.react';
import Tooltip from '../../elements/Tooltip.react';

import { sendMessage } from '../../../utils/RoomAPI';
import {
  setChatInputValue,
  restoreMessage,
  setEmojiPicker,
  insertEmoji,
  setEmojiSearch,
  setSelectedEmojiResult,
} from '../../../actions/ChatActions';

export class RoomChatInput extends Component {
  constructor(props) {
    super(props);
    this.matchString = '';
    this.matchIndex = 0;
    this.selectedMatch = false;
    this.sendMessage = sendMessage;
    this.setChatInputValue = setChatInputValue;
    this.restoreMessage = restoreMessage;
    this.setEmojiSearch = setEmojiSearch;
    this.setSelectedEmojiResult = setSelectedEmojiResult;

    this.handleChange = this.handleChange.bind(this);
    this.handleAutocomplete = this.handleAutocomplete.bind(this);
    this.doSendMessage = this.doSendMessage.bind(this);
    this.handleSelectPrevious = this.handleSelectPrevious.bind(this);
    this.handleGift = this.handleGift.bind(this);
    this.setEmoji = this.setEmoji.bind(this);
    this.codeRegExp = /:([a-zA-Z0-9+_]{2,})$/;

    window.addEventListener('keydown', this.handleSelectPrevious);
  }

  setEmoji(code) {
    const { value } = this.input;
    const newValue = value.replace(this.codeRegExp, code);
    this.setChatInputValue(newValue);
    this.setEmojiSearch([], '');
    this.setSelectedEmojiResult(0);
  }


  handleSelectPrevious(e) {
    if (e.code === 'ArrowUp') {
      this.restoreMessage();
    }

    if (e.code === 'ArrowDown') {
      this.restoreMessage(false);
    }
  }

  handleChange(e) {
    // reset match selection
    this.selectedMatch = false;
    const { value } = e.target;
    this.setChatInputValue(value);

    const codeMatch = value.match(this.codeRegExp) || [];
    if (!codeMatch.length) {
      this.setEmojiSearch([], null);
    } else {
      this.completeEmoji(codeMatch[1]);
    }
  }

  completeName(value) {
    const {
      users,
      roleState: {
        roles,
      },
    } = this.props;

    const [, prefix, actualValue] = value.match(/(\/\w+\s|@)(\w+)?/);
    const suffix = prefix === '@' ? ': ' : '';

    // detect whether we've starting matching
    if (!this.selectedMatch) {
      // match all the users and put them in a class var
      this.handleMatches = users
        .filter(({ username, handle }) => {
          let usernameMatch;
          const handleMatch = handle.match(new RegExp(`${actualValue}.*`));

          if (username) {
            usernameMatch = username.match(new RegExp(`${actualValue}.*`));
          }

          return usernameMatch || handleMatch;
        })
        .map(({ username, handle }) => {
          const matchUsername = (username
            && username.match(new RegExp(`${actualValue}.*`)));

          if (matchUsername) {
            return username;
          }

          return handle;
        });

      this.handleMatches = [
        ...this.handleMatches,
        roles
          .filter(({ tag }) => tag.match(new RegExp(`${actualValue}.*`)))
          .map(({ tag }) => tag),
      ];

      // save the string,
      // so we can detect if it's changed and then create new matche array
      if (this.handleMatches.length) {
        this.selectedMatch = true;
        this.matchString = value;
        this.matchIndex = 0;
      }
    } else {
      // if we're not getting new matches,
      // set the current match index to the next one,
      // or the first if we've already reached the end
      const currentlyLastMatch = this.handleMatches.length < this.matchIndex + 2;
      this.matchIndex = currentlyLastMatch ? 0 : this.matchIndex += 1;
    }

    // only set the match in the input if there are any
    if (this.handleMatches.length) {
      this.setChatInputValue(`${prefix}${this.handleMatches[this.matchIndex]}${suffix}`);
    }
  }

  completeEmoji(value) {
    const { customEmoji } = this.props;
    const customSearch = customEmoji.filter(e => e.name.indexOf(value) > -1);
    let search = emojiIndex.search(value);

    if (search.length > 20) {
      search = search.slice(0, 40);
    }
    this.setEmojiSearch([...search, ...customSearch], value);
  }

  handleAutocomplete(e) {
    const {
      keyCode,
      shiftKey,
    } = e;
    const { value } = this.input;
    const {
      emojiSearch: {
        selected,
        results,
      },
    } = this.props;

    const tab = keyCode === 9;
    const enter = keyCode === 13;
    const esc = keyCode === 27;
    const revTab = tab && shiftKey;

    if ((tab || revTab) || (enter && results.length > 0) || esc) {
      e.preventDefault();
    } else {
      return false;
    }

    if (value.match(/^(\/\w+\s|@)/)) {
      return this.completeName(value);
    }

    const codeMatch = value.match(this.codeRegExp) || [];

    if (codeMatch.length && (tab || revTab)) {
      const dir = revTab ? -1 : 1;
      const start = revTab ? results.length - 1 : 0;
      const end = revTab ? 0 : results.length - 1;
      const nextSelected = selected === end ? start : selected + dir;
      return this.setSelectedEmojiResult(nextSelected);
    }

    if (esc && results.length) {
      this.setEmojiSearch([], '');
    }

    if (enter && results.length) {
      return this.setEmoji(results[selected].colons);
    }

    return false;
  }

  doSendMessage(e) {
    e.preventDefault();
    const {
      room,
      userState: { user },
    } = this.props;
    const loneSurrogateRe = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    const message = this.input.value
      .slice(0, 255)
      .replace(loneSurrogateRe, '')
      .trim();

    if (message.length && user.hasChangedHandle) {
      this.sendMessage(message, room);
      this.setChatInputValue('');
    }
  }

  handleGift(e) {
    e.preventDefault();
    const { roomOwnerId } = this.props;
    window.open(`/support/payment?productId=onetime&amount=300&beneficiary=${roomOwnerId}`, '_blank');
  }

  render() {
    const {
      emojiPickerOpen,
      chatInputValue,
      emojiSearch: {
        results,
        query,
        selected,
      },
      customEmoji,
      roomOwnerId,
    } = this.props;
    return (
      <form className="chat__InputWrapper" onSubmit={this.doSendMessage}>
        <TetherComponent
          attachment="top center"
          constraints={[{
            to: 'scrollParent',
            attachment: 'together',
          }]}
        >
          <input
            type="text"
            className="input chat__Input"
            ref={(e) => { this.input = e; }}
            maxLength="255"
            onKeyDown={this.handleAutocomplete}
            onChange={this.handleChange}
            value={chatInputValue}
            placeholder="Start typing"
          />
          {results.length > 0 && (
            <EmojiPredict
              query={query}
              emojis={results}
              selected={selected}
              onSelect={({ colons }) => this.setEmoji(colons)}
            />
          )}
        </TetherComponent>
        <EmojiPicker
          open={emojiPickerOpen}
          onToggle={() => setEmojiPicker(!emojiPickerOpen)}
          onSelect={({ colons }) => insertEmoji(colons)}
          onClickOutside={() => setEmojiPicker(false)}
          customEmoji={customEmoji}
        />
        {roomOwnerId && (
          <Tooltip
            text="Gift the room support to add perks"
          >
            <button
              type="button"
              className="button button-clear chat__InputAction"
              onClick={this.handleGift}
            >
              <FontAwesomeIcon
                icon={['fas', 'gift']}
              />
            </button>
          </Tooltip>
        )}
      </form>
    );
  }
}

RoomChatInput.defaultProps = {
  users: [],
  room: null,
  chatInputValue: '',
  roomOwnerId: null,
};

RoomChatInput.propTypes = {
  users: PropTypes.array,
  room: PropTypes.string,
  chatInputValue: PropTypes.string,
  emojiPickerOpen: PropTypes.bool.isRequired,
  roleState: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.shape({
      tag: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
  userState: PropTypes.shape({
    user: PropTypes.shape({
      hasChangedHandle: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  emojiSearch: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      colons: PropTypes.string,
    })),
    query: PropTypes.string,
    selected: PropTypes.number,
  }).isRequired,
  customEmoji: PropTypes.arrayOf(PropTypes.shape).isRequired,
  roomOwnerId: PropTypes.string,
};

export default withState(RoomChatInput);
