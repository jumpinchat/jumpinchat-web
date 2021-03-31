import React from 'react';
import PropTypes from 'prop-types';

const ListItemCheckbox = ({
  className,
  checked,
  onChange,
  label,
}) => (
  <label
    htmlFor={label.toLowerCase().split(' ').join('')}
    className={className}
  >
    {label}
    <input
      id={label.toLowerCase().split(' ').join('')}
      checked={checked}
      className="jic-checkbox"
      onChange={onChange}
      type="checkbox"
    />
  </label>
);

ListItemCheckbox.defaultProps = {
  className: '',
};

ListItemCheckbox.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default ListItemCheckbox;
