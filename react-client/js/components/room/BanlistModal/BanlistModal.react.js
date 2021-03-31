/**
 * Created by Zaccary on 21/06/2015.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import moment from 'moment';
import { setBanlistModal } from '../../../actions/ModalActions';
import { sendOperatorAction } from '../../../utils/RoomAPI';
import BanListItem from './BanlistItem.react';

class BanListModal extends Component {
  constructor(props) {
    super(props);

    this.setBanlistModal = setBanlistModal;
    this.sendOperatorAction = sendOperatorAction;
    this.closeModal = this.closeModal.bind(this);
    this.handleUnbanUser = this.handleUnbanUser.bind(this);
  }

  closeModal() {
    this.setBanlistModal(false);
  }

  handleUnbanUser(banlistId, handle) {
    this.sendOperatorAction('unban', {
      banlistId,
      handle,
    });
  }

  render() {
    let banlistItems = [];
    const { error, banlist, isOpen } = this.props;

    banlistItems = banlist
      .filter(listItem => !moment(listItem.timestamp).add(24, 'hours').isBefore(moment()));

    return (
      <Modal
        overlayClassName="modal"
        className="modal__Window"
        isOpen={isOpen}
        onRequestClose={this.closeModal}
        contentLabel="Ban list modal"
      >
        <div className="modal__Header">
          Banlist
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
            {banlistItems.length > 0 && banlistItems.map(listItem => (
              <BanListItem
                item={listItem}
                removeLabel="Unban"
                onRemove={() => this.handleUnbanUser(listItem._id, listItem.handle)}
                key={listItem.timestamp}
              />
            ))}

            {banlistItems.length === 0 && (<span className="text-sub">Banlist empty.</span>)}
          </div>
          {!!error && (
            <span className="text text-red modal__Error">{error.message}</span>
          )}
        </div>
      </Modal>
    );
  }
}

BanListModal.defaultProps = {
  isOpen: false,
  error: null,
  banlist: [],
};

BanListModal.propTypes = {
  isOpen: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }),
  banlist: PropTypes.array,
};

export default BanListModal;
