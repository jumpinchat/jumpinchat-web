import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Switch = ({
  onChange,
  checked,
  label,
  helpText,
  id,
  disabled,
}) => (
  <label
    className={classnames('switch__Wrapper', {
      'switch__Wrapper--disabled': disabled,
    })}
    htmlFor={id}
  >
    <input
      id={id}
      type="checkbox"
      className="jic-checkbox"
      checked={checked}
      onChange={() => onChange(!checked)}
      disabled={disabled}
    />
    <div className="switch__Label">
      {label}
      {helpText && (
        <span className="text-sub switch__HelpText">{helpText}</span>
      )}
    </div>
    <button
      type="button"
      className={classnames('switch__Input', {
        'switch__Input--checked': checked,
      })}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  </label>
);

Switch.defaultProps = {
  helpText: null,
  disabled: false,
};

Switch.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Switch;
