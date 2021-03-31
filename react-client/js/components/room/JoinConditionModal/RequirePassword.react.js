/* global window */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { submitRoomPassword } from '../../../utils/RoomAPI';

class RequirePassword extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.state = {
      error: null,
    };
  }

  focusInput() {
    this.input.focus();
  }

  handleSubmit(e) {
    e.preventDefault();
    const { room } = this.props;
    const password = this.input.value;
    submitRoomPassword(room, password, (err) => {
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
    const {
      error,
    } = this.state;
    const {
      isOpen,
    } = this.props;
    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        contentLabel="Room info modal"
        onAfterOpen={this.focusInput}
      >
        <div className="modal__Header">
          Password required
        </div>
        <div className="modal__Body">
          <form className="form form-inline" onSubmit={this.handleSubmit}>
            <input
              type="password"
              className="input form__Input form__Input-inline"
              ref={(e) => { this.input = e; }}
            />
            <button className="button button-blue">Submit</button>
          </form>
          {!!error && (
            <span className="text text-red modal__Error">
              {error}
            </span>
          )}
        </div>
      </Modal>
    );
  }
}

RequirePassword.propTypes = {
  room: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default RequirePassword;
