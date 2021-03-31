import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const RequireAccount = ({ isOpen }) => (
  <Modal
    overlayClassName="modal"
    className="modal__Window"
    isOpen={isOpen}
    contentLabel="Room info modal"
  >
    <div className="modal__Header">
      User account required
    </div>
    <div className="modal__Body">
      <strong>Log in or register an account to enter this room</strong>
    </div>
    <div className="modal__Footer">
      <a
        className="button button-blue button-floating modal__Action"
        href="/register"
      >
        Register
      </a>
      <a
        className="button button-black button-floating modal__Action"
        href="/login"
      >
        Log in
      </a>
    </div>
  </Modal>
);

RequireAccount.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default RequireAccount;
