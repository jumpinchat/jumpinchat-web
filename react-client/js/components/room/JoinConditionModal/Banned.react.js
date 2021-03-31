import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const Banned = ({ isOpen, reason }) => (
  <Modal
    overlayClassName="modal"
    className="modal__Window"
    isOpen={isOpen}
    contentLabel="Room info modal"
  >
    <div className="modal__Header">
      You have been banned from this room.
    </div>
    <div className="modal__Body">
      <p>
        You will not be able to join this room until the
        ban expires or is&nbsp;cleared.
      </p>
      {!!reason && (
        <p>
          <strong>Reason: </strong>
          {reason}
        </p>
      )}

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

Banned.defaultProps = {
  reason: null,
};

Banned.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  reason: PropTypes.string,
};

export default Banned;
