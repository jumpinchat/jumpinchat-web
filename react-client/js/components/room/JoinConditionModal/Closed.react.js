import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {
  codes,
  reasons,
} from '../../../constants/CloseReasons';

const NudityInfo = () => (
  <Fragment>
    <p>
      Should you want to continue such activity, there
      is the option to use an <a href="/help/room#age-restricted">age restricted room</a>.
    </p>
    <p>
      You must also <a href="/help/ageverify">verify your age</a> in order to
      broadcast in restricted rooms. However, nudity and other such activity
      will be permitted for verified users.
    </p>
  </Fragment>
);

const Closed = ({ isOpen, reason }) => (
  <Modal
    overlayClassName="modal"
    className="modal__Window"
    isOpen={isOpen}
    contentLabel="Room info modal"
  >
    <div className="modal__Header">
      A site moderator has closed this room.
    </div>
    <div className="modal__Body">
      <p>
        You will not be able to join this room until the
        closure expires or is&nbsp;cleared.
      </p>

      {!!reason && (
        <p>
          <strong>Reason: </strong>
          {reasons[reason]}
        </p>

      )}
      {reason && reason === codes.BAN_NUDITY && (
        <NudityInfo />
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

Closed.defaultProps = {
  reason: null,
};

Closed.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  reason: PropTypes.string,
};

export default Closed;
