import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { trackEvent } from '../../utils/AnalyticsUtil';
import {
  setInfoModal,
} from '../../actions/ModalActions';

import {
  setInfoRead,
} from '../../utils/RoomAPI';

class RoomInfoModal extends Component {
  constructor() {
    super();
    this.setInfoModal = setInfoModal;
    this.setInfoRead = setInfoRead;
    this.dismissModal = this.dismissModal.bind(this);
  }

  dismissModal() {
    const { roomId } = this.props;
    this.setInfoModal(false);
    this.setInfoRead(roomId);
    trackEvent('New Account', 'Dismiss info modal');
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
          Welcome to your new room!
        </div>
        <div className="modal__Body modal__Body--scroll">
          <h3>What you can do right now</h3>

          <p>
            There&apos;s no one here besides you right now, but you can start inviting
            people by copying the link above the chat feed. You can also show the
            room on the public directory from
            your <a href="/settings/room" target="_blank">room settings</a>.

          </p>
          <p>
            Broadcasting is as easy as hitting
            the <strong>Start Broadcasting</strong> button above and selecting
            a video and audio source. There&apos;s more details available
            on the <a href="/help/cams" target="_blank">cam help</a> page.
          </p>


          <h3>Room settings</h3>
          <p>
            Since you own this chat room, you have the ability to change some settings,
            or customise it a little.
          </p>
          <p>
            Room and chat settings can be found via the <strong>chat settings</strong>, accessed
            by the gear icon
            {' ('}
            <FontAwesomeIcon
              icon={['fas', 'cog']}
            />
            {') '}
            above the chat feed, or via the keyboard shortcut <kbd>Ctrl/Cmd + ,</kbd>
          </p>
          <p>
            Moderators and other roles are added via <i>chat settings -&gt; users</i> by
            searching for and assigning roles to existing accounts. Other room management
            settings are also available, such as room topic and ban lists.
            More information can be found
            in the <a href="/help/mod#assign" target="_blank">moderation help page</a>
          </p>
          <p>
            Additionally, you will have access to settings to control your own
            experience. Appearance, sound and media settings, as well as handling
            ignore lists can be found in chat settings.
          </p>
        </div>
        <div className="modal__Footer">
          <button
            className="button button-blue button-floating modal__Action"
            onClick={this.dismissModal}
            type="button"
          >
            OK
          </button>
        </div>
      </Modal>
    );
  }
}

RoomInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  roomId: PropTypes.string.isRequired,
};

export default RoomInfoModal;
