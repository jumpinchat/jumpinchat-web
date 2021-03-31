import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SettingsClose = ({ onClick }) => (
  <div className="settings__Close">
    <button
      className="settings__CloseButton"
      type="button"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={['far', 'times']} />
    </button>
    <span className="settings__CloseLabel">ESC</span>
  </div>
);

SettingsClose.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SettingsClose;
