import React from 'react';
import PropTypes from 'prop-types';

const NotificationWrapper = ({
  className,
  children,
  action,
  onPause,
  onResume,
  onClose,
}) => {
  const { type, payload } = action;
  const props = {
    onMouseEnter: onPause,
    onMouseLeave: onResume,
    onClick: onClose,
    className,
  };

  switch (type) {
    case 'link':
      return (
        <a
          href={payload}
          target="_blank"
          {...props}
        >
          {children}
        </a>
      );
    default:
      return (
        <div {...props}>
          {children}
        </div>
      );
  }
};

NotificationWrapper.defaultProps = {
  action: {
    type: 'message',
  },
};

NotificationWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  action: PropTypes.shape({
    type: PropTypes.string,
    payload: PropTypes.string,
  }),
};

export default NotificationWrapper;
