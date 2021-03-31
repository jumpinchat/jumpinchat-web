import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import BanListItem from '../BanlistModal/BanlistItem.react';
import { unignoreUser } from '../../../utils/RoomAPI';
import { setIgnoreListModal } from '../../../actions/ModalActions';

class IgnoreListModal extends Component {
  constructor() {
    super();

    this.unignoreUser = unignoreUser;
    this.setIgnoreListModal = setIgnoreListModal;
    this.closeModal = this.closeModal.bind(this);
    this.handleUnIgnore = this.handleUnIgnore.bind(this);
  }

  closeModal() {
    this.setIgnoreListModal(false);
  }

  handleUnIgnore(id) {
    this.unignoreUser(id);
  }

  render() {
    const {
      isOpen,
      ignoreList,
      error,
    } = this.props;
    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        onRequestClose={this.closeModal}
        contentLabel="Ban list modal"
      >
        <div className="modal__Header">
          Ignored users
          <button
            type="button"
            className="modal__Button modal__Button-close"
            onClick={this.closeModal}
          >
            <i className="fa fa-times" />
          </button>
        </div>
        <div className="modal__Body">
          <div className="banlist__List">
            {ignoreList.length > 0 && ignoreList.map(listItem => (
              <BanListItem
                removeLabel="Unignore"
                onRemove={() => this.handleUnIgnore(listItem.id)}
                item={listItem}
                key={listItem.timestamp}
              />
            ))}

            {ignoreList.length === 0 && (<span className="text-sub">Ignore list empty.</span>)}
          </div>

          {!!error && (
            <span className="text text-red modal__Error">{error.message}</span>
          )}
        </div>
      </Modal>
    );
  }
}

IgnoreListModal.defaultProps = {
  isOpen: false,
  error: null,
  ignoreList: [],
};

IgnoreListModal.propTypes = {
  isOpen: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }),
  ignoreList: PropTypes.arrayOf(PropTypes.shape({
    userListId: PropTypes.string.isRequired,
    userId: PropTypes.string,
    timestamp: PropTypes.string,
  })),
};

export default IgnoreListModal;
