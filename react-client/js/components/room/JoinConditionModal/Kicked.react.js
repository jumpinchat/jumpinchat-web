import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const Banned = ({ isOpen }) => (
  <Modal
    overlayClassName="modal"
    className="modal__Window"
    isOpen={isOpen}
    contentLabel="Room info modal"
  >
    <div className="modal__Header">
      You were kicked from this room.
    </div>
    <div className="modal__Body">
      <p>
        You can rejoin the room, though perhaps
        behave yourself better next time.
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

Banned.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Banned;
