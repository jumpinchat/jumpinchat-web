import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Radio = ({
  value,
  label,
  name,
  checked,
  onChange,
}) => (
  <label
    className={classNames('settings__RadioElement', {
      'settings__RadioElement--checked': checked,
    })}
  >
    <input
      type="radio"
      className="settings__RadioInput"
      value={value}
      name={name}
      onChange={onChange}
      checked={checked}
    />
    {!checked && (
      <FontAwesomeIcon icon={['far', 'square']} />
    )}
    {checked && (
      <FontAwesomeIcon icon={['fas', 'check-square']} />
    )}
    {' '}
    {label}
  </label>
);

Radio.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
};

const RadioContainer = ({
  value,
  name,
  title,
  onChange,
  children,
}) => (
  <div className="settings__RadioContainer">
    <h3 className="settings__Title">{title}</h3>
    {React.Children.map(children, child => React.cloneElement(child, {
      onChange,
      name,
      checked: child.props.value === value,
    }))}
  </div>
);

RadioContainer.defaultProps = {
  name: null,
};

RadioContainer.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export {
  Radio,
  RadioContainer,
};
