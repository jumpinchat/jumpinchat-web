import React from 'react';
import PropTypes from 'prop-types';
import TetherComponent from 'react-tether';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withState } from '../../../../utils/withState';
import PickerPopup from './PickerPopup.react';

const EmojiPicker = ({
  open,
  onToggle,
  onSelect,
  onClickOutside,
  customEmoji,
  userState: {
    user: {
      settings: {
        darkTheme,
      },
    },
  },
}) => (
  <TetherComponent
    attachment="top center"
    constraints={[{
      to: 'window',
      attachment: 'together',
      pin: true,
    }]}
  >
    <button
      type="button"
      className="button button-clear chat__InputAction"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <FontAwesomeIcon
        icon={['fas', 'smile']}
      />
    </button>
    {open && (
      <PickerPopup
        darkTheme={darkTheme}
        onSelect={onSelect}
        onClickOutside={onClickOutside}
        custom={customEmoji}
      />
    )}
  </TetherComponent>
);

EmojiPicker.defaultProps = {
  customEmoji: [],
};

EmojiPicker.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClickOutside: PropTypes.func.isRequired,
  customEmoji: PropTypes.arrayOf(PropTypes.shape({
    alias: PropTypes.string,
    image: PropTypes.string,
  })),
  userState: PropTypes.shape({
    user: PropTypes.shape({
      settings: PropTypes.shape({
        darkTheme: PropTypes.bool,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default withState(EmojiPicker);
