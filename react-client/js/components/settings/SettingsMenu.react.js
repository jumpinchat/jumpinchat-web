import React, { Fragment, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const SettingsMenu = ({
  onChange,
  current,
  menuOpen,
  items,
  onClose,
}) => {
  const node = useRef();

  const handleClickOutside = (e) => {
    if (node.current.contains(e.target)) {
      return false;
    }

    return onClose();
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <Fragment>
      {menuOpen && (
        <div className="settings__MenuBackdrop" />
      )}
      <div
        className={classNames('settings__Menu', {
          'settings__Menu--open': menuOpen,
        })}
        ref={node}
      >
        {items.map(item => (
          <Fragment key={item.id}>
            <h3 className="settings__Title settings__MenuTitle">{item.label}</h3>
            <ul className="settings__MenuItems">
              {item.items.map(subItem => (
                <li key={subItem.id.description} className="settings__MenuItem">
                  <button
                    type="button"
                    className={classNames('settings__MenuItemButton', {
                      'settings__MenuItemButton--current': subItem.id === current,
                    })}
                    onClick={() => onChange(subItem.id)}
                  >
                    {subItem.label}
                  </button>
                </li>
              ))}
            </ul>
          </Fragment>
        ))}
      </div>
    </Fragment>
  );
};

SettingsMenu.propTypes = {
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  current: PropTypes.string.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      id: PropTypes.symbol.isRequired,
    })).isRequired,
  })).isRequired,
};

export default SettingsMenu;
