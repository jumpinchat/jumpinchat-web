import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { setBanModal, setModalError } from '../../../actions/ModalActions';
import { sendOperatorAction } from '../../../utils/RoomAPI';

class BanConfirmModal extends Component {
  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this._focusInput = this._focusInput.bind(this);
    this.handleBan = this.handleBan.bind(this);
    this.setBanModal = setBanModal;
  }

  _focusInput() {
    this.input.focus();
  }

  closeModal() {
    this.setBanModal(false);
  }

  handleBan(e) {
    e.preventDefault();
    const { target } = this.props;
    sendOperatorAction('ban', { user_list_id: target, duration: this.input.value });
    this.closeModal();
  }

  render() {
    const { error, open } = this.props;

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={open}
        onAfterOpen={this._focusInput}
        onRequestClose={this.closeModal}
        contentLabel="Change handle"
      >
        <div className="modal__Header">
          Ban user
        </div>
        <form onSubmit={this.handleBan}>
          <div className="modal__Body">
            <div className="form__InputGroup">
              <label
                htmlFor="duration"
                className="form__InputLabel"
              >
                Duration
              </label>
              <select
                id="duration"
                name="duration"
                className="input form__Input form__Input-inline form__Input-floating"
                defaultValue="24"
                ref={(e) => { this.input = e; }}
              >
                <option value="1">1 hour</option>
                <option value="3">3 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                <option value="4464">Permanent</option>
              </select>
            </div>

            {error && (
              <span className="text text-red modal__Error">{error.message}</span>
            )}
          </div>
          <div className="modal__Footer">
            <button
              type="submit"
              className="button button-blue button-floating modal__Action"
              disabled={!!error}
            >
              Ban
            </button>
            <button
              type="button"
              className="button button-default button-floating modal__Action"
              onClick={this.closeModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    );
  }
}

BanConfirmModal.defaultProps = {
  open: false,
  error: null,
  target: null,
};

BanConfirmModal.propTypes = {
  open: PropTypes.bool,
  target: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }),
};

export default BanConfirmModal;
