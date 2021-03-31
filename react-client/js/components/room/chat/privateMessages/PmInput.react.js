import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import chatStore from '../../../../stores/ChatStore/ChatStore';

export class PmInput extends PureComponent {
  constructor() {
    super();
    this.getHandleByUserId = chatStore.getHandleByUserId.bind(chatStore);
  }

  render() {
    const {
      onSendMessage,
      onChange,
      onKeyDown,
      onFocus,
      value,
      disabled,
      participant,
    } = this.props;

    const handle = this.getHandleByUserId(participant.userListId);
    return (
      <form className="chat__InputWrapper" onSubmit={onSendMessage}>
        <input
          type="text"
          className="input chat__Input"
          maxLength="255"
          onKeyDown={onKeyDown}
          onChange={onChange}
          onFocus={() => onFocus(participant.userListId)}
          value={value}
          disabled={disabled}
          placeholder={`Send a message to ${handle}`}
        />
      </form>
    );
  }
}

PmInput.defaultProps = {
  onKeyDown: () => {},
  disabled: false,
};

PmInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  participant: PropTypes.shape({
    userListId: PropTypes.string.isRequired,
    userId: PropTypes.string,
  }).isRequired,
};

export default PmInput;
