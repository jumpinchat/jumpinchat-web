import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const ScrollResume = ({ onResume, visible }) => (
  <button
    type="button"
    className={classnames('button', 'button-blue', 'chat__ScrollResume', {
      'chat__ScrollResume--visible': visible,
    })}
    onClick={onResume}
  >
    Resume scrolling
  </button>
);

ScrollResume.propTypes = {
  onResume: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default ScrollResume;
