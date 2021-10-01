import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollArea from '../../elements/ScrollArea.react';

const RoleDropdown = ({
  roles,
  enrollments,
  onAddRole,
  onRemoveRole,
  onClose,
  isOpen,
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

  const hasRole = tag => enrollments.some(e => e.tag === tag);

  return (
    <ScrollArea
      className="roomUserSettings__RoleListDropdown"
      horizontal={false}
    >
      <ul className="roomUserSettings__RoleList" ref={node}>
        {roles.map((role) => {
          const enrollment = enrollments.find(e => e.tag === role.tag);
          return (
            <li className="roomUserSettings__RoleListItem" key={role.tag}>
              {role.name}
              {!hasRole(role.tag) && (
                <button
                  className="button button-clear roomUserSettings__ListItemAction"
                  type="button"
                  onClick={() => onAddRole(role._id)}
                >
                  <FontAwesomeIcon icon={['fas', 'square']} />
                </button>
              )}
              {hasRole(role.tag) && (
                <button
                  className="button button-clear roomUserSettings__ListItemAction"
                  type="button"
                  onClick={() => onRemoveRole(enrollment.enrollmentId)}
                >
                  <FontAwesomeIcon icon={['fas', 'check-square']} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
};

RoleDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddRole: PropTypes.func.isRequired,
  onRemoveRole: PropTypes.func.isRequired,
  enrollments: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    roleId: PropTypes.string.isRequired,
    enrollmentId: PropTypes.string.isRequired,
  })).isRequired,
  roles: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
  })).isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default RoleDropdown;
