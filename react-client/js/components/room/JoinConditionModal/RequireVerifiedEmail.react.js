import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const RequireVerifiedEmail = ({ isOpen }) => (
  <Modal
    overlayClassName="modal"
    className="modal__Window"
    isOpen={isOpen}
    contentLabel="Room info modal"
  >
    <div className="modal__Header">
      Verified email required
    </div>
    <div className="modal__Body">
      <strong>You must verify your email before entering this room</strong>
    </div>
    <div className="modal__Footer">
      <a
        className="button button-blue button-floating modal__Action"
        href="/settings/account"
      >
        Open settings
      </a>
      <a
        className="button button-black button-floating modal__Action"
        href="/"
      >
        Back
      </a>
    </div>
  </Modal>
);

RequireVerifiedEmail.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default RequireVerifiedEmail;
