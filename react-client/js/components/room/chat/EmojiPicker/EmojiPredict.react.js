import React from 'react';
import PropTypes from 'prop-types';
import { Emoji } from 'emoji-mart';
import cx from 'classnames';

const EmojiPredict = ({
  query,
  emojis,
  selected,
  onSelect,
}) => (
  <div className="emojiPredict__Container">
    <div className="emojiPredict__Header">
      <div>
        Emoji matching
        {' "'}
        <strong>:{query}</strong>
        {'"'}
      </div>

      <div>
        <span className="emojiPredict__ControlHint">
          <strong>tab</strong> to navigate
        </span>
        <span className="emojiPredict__ControlHint">
          &crarr; to select
        </span>
        <span className="emojiPredict__ControlHint">
          <strong>esc</strong> to dismiss
        </span>
      </div>
    </div>
    <div className="emojiPredict__List">
      {emojis.map((emoji, i) => (
        <span
          key={emoji.id}
          className={
            cx('emojiPredict__Option', {
              'emojiPredict__Option--selected': selected === i,
            })
          }
          onClick={() => onSelect(emoji)}
        >
          <Emoji
            emoji={emoji.custom ? emoji : emoji.id}
            sheetSize={32}
            size={16}
          />
          <span>{emoji.colons}</span>
        </span>
      ))}
    </div>
  </div>
);

EmojiPredict.defaultProps = {
  selected: 0,
};

EmojiPredict.propTypes = {
  selected: PropTypes.number,
  query: PropTypes.string.isRequired,
  emojis: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    colons: PropTypes.string.isRequired,
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default EmojiPredict;
