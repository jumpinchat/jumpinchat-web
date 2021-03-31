import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { trackEvent } from '../../../utils/AnalyticsUtil';
import { setChatColor } from '../../../utils/RoomAPI';

class RoomChatColorPicker extends Component {
  constructor(props) {
    super(props);
    this.setPicker = this.setPicker.bind(this);
    this.setColor = this.setColor.bind(this);
    this.setChatColor = setChatColor;
    this.state = {
      open: false,
    };
  }

  setPicker(e) {
    e.stopPropagation();
    this.setState({ open: !this.state.open });
  }

  setColor(e, color) {
    trackEvent('Chat', 'change chat color');
    this.setChatColor(color);
    this.props.onSelectColor(e);
  }

  render() {
    const { open } = this.state;
    const { colors, activeColor } = this.props;

    if (open) {
      return (
        <div className="chat__ColorPicker">
          {colors.map(color => (
            <button
              key={color}
              className={classnames(
                'chat__ColorPickerOption',
                `chat__Color-${color}`,
                {
                  'chat__ColorPickerOption-active': activeColor === color,
                },
              )}
              onClick={e => this.setColor(e, color)}
            />
          ))}
        </div>
      );
    }

    return (
      <button
        onClick={this.setPicker}
        className="dropdown__Option dropdown__Option-button"
      >
        Change chat color
      </button>
    );
  }
}

RoomChatColorPicker.defaultProps = {
  activeColor: null,
};

RoomChatColorPicker.propTypes = {
  activeColor: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectColor: PropTypes.func.isRequired,
};

export default RoomChatColorPicker;
