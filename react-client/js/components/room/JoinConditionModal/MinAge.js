import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const MinAge = ({ isOpen, min }) => (
  <Modal
    overlayClassName="modal"
    className="modal__Window"
    isOpen={isOpen}
    contentLabel="Room info modal"
  >
    <div className="modal__Header">
      Minimum account age
    </div>
    <div className="modal__Body">
      <p>
        This room has set a minimum account age restriction. Your
        account was created too recently, try again later.
      </p>
      <p>
        Minimum account age: <strong>{min}</strong>
      </p>
    </div>
    <div className="modal__Footer">
      <a
        className="button button-blue button-floating modal__Action"
        href="/"
      >
        Ok
      </a>
    </div>
  </Modal>
);

MinAge.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default MinAge;
