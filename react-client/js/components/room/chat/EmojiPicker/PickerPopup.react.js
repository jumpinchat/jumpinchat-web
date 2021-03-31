import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'emoji-mart';
import clickOutside from 'react-click-outside';

class PickerPopup extends Component {
  handleClickOutside() {
    this.props.onClickOutside();
  }

  render() {
    const { onSelect, custom, darkTheme } = this.props;

    return (
      <Picker
        theme={darkTheme ? 'dark' : 'light'}
        set="apple"
        sheetSize={32}
        onSelect={onSelect}
        showPreview={false}
        custom={custom}
      />
    );
  }
}

PickerPopup.defaultProps = {
  custom: [],
};

PickerPopup.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClickOutside: PropTypes.func.isRequired,
  custom: PropTypes.arrayOf(PropTypes.shape({
    alias: PropTypes.string,
    image: PropTypes.string,
  })),
  darkTheme: PropTypes.bool,
};

export default clickOutside(PickerPopup);
