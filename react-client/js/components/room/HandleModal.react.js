/**
 * Created by Zaccary on 21/06/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { changeHandle } from '../../utils/UserAPI';
import { setHandleModal, setModalError } from '../../actions/ModalActions';
import { resumeAudioContext } from '../../actions/CamActions';

class HandleModal extends Component {
  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this._focusInput = this._focusInput.bind(this);
    this.changeHandle = this.changeHandle.bind(this);
  }

  _focusInput() {
    this.input.focus();
  }

  closeModal() {
    const { user } = this.props;
    // only close the handle selection if user has actually
    // selected a handle after joining
    if (user.hasChangedHandle) {
      setHandleModal(false);
    }
  }

  changeHandle(e) {
    e.preventDefault();
    resumeAudioContext();
    const { user } = this.props;
    const newHandle = this.input.value;
    setModalError(null);

    if (user.handle === newHandle) {
      this.closeModal();
      return;
    }

    changeHandle(newHandle);
  }

  render() {
    let errorMessage = null;
    const { error, user, isOpen } = this.props;

    if (error) {
      errorMessage = (<span className="text text-red modal__Error">{error.message}</span>);
    }

    let handleDefaultValue = user.restoredHandle || user.handle || null;

    if (!user.hasChangedHandle && !user.restoredHandle) {
      handleDefaultValue = null;
    }

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        onAfterOpen={this._focusInput}
        onRequestClose={this.closeModal}
        contentLabel="Change handle"
      >
        <div className="modal__Header">
          {user.hasChangedHandle ? 'Change' : 'Choose'} your nickname

          {
            user.hasChangedHandle && (
              <button
                className="modal__Button modal__Button-close"
                onClick={this.closeModal}
                type="button"
              >
                <i className="fa fa-times" />
              </button>
            )
          }
        </div>
        <div className="modal__Body">
          <form className="form form-inline" onSubmit={this.changeHandle}>
            <input
              type="text"
              className="input form__Input form__Input-inline"
              defaultValue={handleDefaultValue}
              maxLength="16"
              ref={(e) => { this.input = e; }}
            />
            <button className="button button-blue">Go</button>
          </form>
          {errorMessage}
          <div className="modal__SubText">
            Don&apos;t know what to expect? Read the
            {' '}
            <a href="/help/safety" target="_blank" rel="noopener noreferrer">
              safety guide
            </a>
            {' '}
            before joining.
          </div>
        </div>
      </Modal>
    );
  }
}

HandleModal.defaultProps = {
  isOpen: false,
  user: null,
  error: null,
};

HandleModal.propTypes = {
  isOpen: PropTypes.bool,
  user: PropTypes.object,
  error: PropTypes.object,
};

export default HandleModal;
