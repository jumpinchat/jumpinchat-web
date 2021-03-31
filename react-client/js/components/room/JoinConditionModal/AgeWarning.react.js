import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { submitAgeConfirm } from '../../../utils/RoomAPI';

class AgeWarning extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    submitAgeConfirm((err) => {
      if (err) {
        this.setState({
          error: err.message,
        });

        return false;
      }

      return window.location.reload();
    });
  }

  render() {
    const { isOpen } = this.props;

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        contentLabel="Room info modal"
      >
        <div className="modal__Header">
          Room is restricted to 18+
        </div>
        <div className="modal__Body">
          This room is restricted to an adult audience. Nudity or sexual activity
          are permitted.
        </div>
        <div className="modal__Footer">
          <button
            className="button button-blue button-floating modal__Action"
            onClick={this.handleSubmit}
          >
            I am at least 18 years old
          </button>
          <button
            type="button"
            className="button button-default button-floating modal__Action"
            onClick={() => { location.href = '/'; }}
          >
            I do not wish to continue
          </button>
        </div>
      </Modal>
    );
  }
}

AgeWarning.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default AgeWarning;
