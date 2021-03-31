import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinkifyIt from 'linkify-it';
import tlds from 'tlds';
import { Emoji } from 'emoji-mart';
import insertComponentToString from '../../../../utils/insertComponentToString';
import ChatStore from '../../../../stores/ChatStore/ChatStore';

class FormattedMessage extends Component {
  static getEmojiCodes(message) {
    const re = /:[^ :]+:/g;
    let match = [];
    let result = [];
    do {
      match = re.exec(message);
      if (match) {
        result = [...result, {
          index: match.index,
          lastIndex: match.index + match[0].length,
          emoji: match[0],
        }];
      }
    } while (match !== null);

    return result;
  }

  static getInlineFormatting(message) {
    const re = /(?:\*|_)([^\*_]+)(?:\*|_)(?!:|\w|\d|\/)/g;
    let result = [];
    let match = [];
    const elementMap = {
      '*': 'strong',
      _: 'em',
    };

    do {
      match = re.exec(message);
      if (match) {
        const [raw, text] = match;
        const prefix = raw.substr(0, 1);
        const postfix = raw.substr(-1);

        if (prefix === postfix) {
          result = [
            ...result,
            {
              index: match.index,
              lastIndex: match.index + match[0].length,
              text,
              style: elementMap[prefix],
            },
          ];
        }
      }
    } while (match !== null);
    return result;
  }

  constructor(props) {
    super(props);
    const { text } = props;
    const linkMatches = new LinkifyIt().tlds(tlds).match(text) || [];
    this.matches = [
      ...linkMatches,
      ...FormattedMessage.getEmojiCodes(text),
      ...FormattedMessage.getInlineFormatting(text),
    ]
      .sort((a, b) => {
        const aIndex = a.index;
        const bIndex = b.index;

        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;
        return 0;
      });
  }

  render() {
    const { text, status } = this.props;
    return insertComponentToString(text, this.matches, (match) => {
      if (match.emoji) {
        const { emoji } = ChatStore.getState();
        const customEmoji = emoji.find(e => e.colons === match.emoji);

        return (
          <Emoji
            key={match.index}
            set="apple"
            size={24}
            sheetSize={32}
            emoji={customEmoji || match.emoji}
            tooltip
          />
        );
      }

      if (match.url) {
        return (
          <a
            key={match.index}
            href={match.url}
            rel="noopener noreferrer"
            target="_blank"
            className="chat__MessageBody-link"
          >
            {match.raw}
          </a>
        );
      }

      if (match.text && match.style && !status) {
        switch (match.style) {
          case 'em':
            return (<em key={match.index}>{match.text}</em>);
          case 'strong':
            return (<strong key={match.index}>{match.text}</strong>);
          default:
            return match.text;
        }
      }

      return null;
    });
  }
}

FormattedMessage.defaultProps = {
  status: false,
};

FormattedMessage.propTypes = {
  text: PropTypes.string.isRequired,
  status: PropTypes.bool,
};

export default FormattedMessage;
