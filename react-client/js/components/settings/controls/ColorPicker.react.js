import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ColorPicker = ({ colors, activeColor, onChange }) => (
  <div className="settings__ColorPicker">
    {colors.map(color => (
      <button
        type="button"
        key={color}
        className={classNames(
          'settings__ColorPickerOption',
          `settings__Color-${color}`,
          {
            'settings__ColorPickerOption-active': activeColor === color,
          },
        )}
        onClick={() => onChange(color)}
      />
    ))}
  </div>
);

ColorPicker.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeColor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ColorPicker;
