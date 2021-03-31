import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const SelectInput = React.forwardRef(({
  className,
  label,
  subTitle,
  value,
  options,
  onChange,
  error,
  id,
}, ref) => (
  <div className={classNames('settings__TextInputGroup', className)}>
    <div className="settings__TextInputLabelWrapper">
      <label
        className="settings__Title settings__TextInputLabel"
        htmlFor={id}
      >
        {label}
      </label>
      {subTitle && (
        <span className="text-sub">{subTitle}</span>
      )}
    </div>
    <div className="settings__TextInputWrapper">
      <select
        id={id}
        className={classNames('input form__Input', 'settings__TextInput')}
        value={value}
        ref={ref}
        onChange={onChange}
      >
        {options.map(opt => (
          <option value={opt.value} key={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    {error && (
      <span className="text-red settings__TextInputError">{error}</span>
    )}
  </div>
));

SelectInput.defaultProps = {
  className: '',
  subTitle: null,
  value: '',
  onChange: () => {},
  error: null,
};

SelectInput.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
};

export default SelectInput;
