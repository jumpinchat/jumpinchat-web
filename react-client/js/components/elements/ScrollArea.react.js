import React from 'react';
import PropTypes from 'prop-types';
import ReactScrollBar from 'react-scrollbar';
import classnames from 'classnames';

const ScrollArea = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <ReactScrollBar
    className={classnames('scroll-area', className)}
    stopScrollPropagation
    ref={ref}
    {...props}
  >
    {children}
  </ReactScrollBar>
));

ScrollArea.defaultProps = {
  className: null,
};

ScrollArea.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ScrollArea;
