import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SettingsMobileMenuButton = ({ onClick }) => (
  <div className="settings__MobileMenu">
    <button
      className="settings__CloseButton settings__MobileMenuButton"
      type="button"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={['fas', 'bars']} />
    </button>
  </div>
);

SettingsMobileMenuButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SettingsMobileMenuButton;
