import React, { useEffect, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TetherComponent from 'react-tether';
import ScrollArea from '../../elements/ScrollArea.react';

const IconPicker = ({
  onOpen,
  onClose,
  onChange,
  isOpen,
  value,
  icons,
}) => {
  const node = useRef();

  const handleClickOutside = (e) => {
    if (node.current.contains(e.target)) {
      return false;
    }

    return onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <TetherComponent
      attachment="top center"
      constraints={[
        {
          to: 'window',
          attachment: 'together',
          pin: true,
        },
      ]}
    >
      <button
        type="button"
        onClick={!isOpen && onOpen}
        className={classNames(
          'button',
          'button--clear',
          'roles__IconPickerAction',
        )}
      >
        <FontAwesomeIcon icon={['fas', value]} />
      </button>
      {isOpen && (
        <ScrollArea
          className="roles__IconPicker"
          horizontal={false}
        >
          <div className="roles__IconPickerWrapper" ref={node}>
            {icons.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => onChange(icon)}
                className={classNames('button', 'button--clear', 'roles__IconPickerItem', {
                  'roles__IconPickerItem--selected': icon === value,
                })}
              >
                <FontAwesomeIcon icon={['fas', icon]} />
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </TetherComponent>
  );
};

IconPicker.defaultProps = {
  value: null,
};

IconPicker.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  value: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default IconPicker;
