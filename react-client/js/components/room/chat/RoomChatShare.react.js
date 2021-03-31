/* global location, window */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Clipboard from 'clipboard';
import { addNotification } from '../../../actions/NotificationActions';

class RoomChatShare extends Component {
  static hasShareAPI() {
    return !!window.navigator.share;
  }

  constructor(props) {
    super(props);
    this.link = `jumpin.chat/${props.roomName}`;
    if (!RoomChatShare.hasShareAPI()) {
      this.clipboard = new Clipboard('.chat__ShareCopy', {
        target: () => this.input,
        text: () => `https://${this.link}`,
      });
    } else {
      this.handleShare = this.handleShare.bind(this);
    }
  }

  componentDidMount() {
    if (this.clipboard) {
      this.clipboard.on('success', () => addNotification({
        color: 'green',
        message: 'Room link copied!',
      }));

      this.clipboard.on('error', () => addNotification({
        color: 'yellow',
        message: 'Could not copy link',
      }));
    }
  }

  componentWillUnmount() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  }

  handleShare() {
    if (!RoomChatShare.hasShareAPI()) {
      return;
    }

    const { roomName } = this.props;
    const sharePromise = window.navigator.share({
      title: window.document.title,
      text: `Come and join my chat room: ${roomName}!`,
      url: `https://${this.link}`,
    });

    sharePromise.then(() => addNotification({
      color: 'green',
      message: 'Room link copied!',
    }));

    sharePromise.catch((err) => {
      console.error({ err });

      if (err.name === 'AbortError') {
        console.log('share aborted');
        return null;
      }

      return addNotification({
        color: 'yellow',
        message: 'Could not copy link',
      });
    });
  }

  render() {
    return (
      <div className="chat__Share">
        <input
          className="input chat__ShareInput"
          type="text"
          ref={(e) => { this.input = e; }}
          defaultValue={this.link}
          readOnly="readonly"
        />
        <button
          className="button chat__ShareCopy"
          type="button"
          title="Copy a link to the room to share elsewhere"
          onClick={this.handleShare}
        >
          <i className="fa fa-clipboard" />
        </button>
      </div>
    );
  }
}

RoomChatShare.propTypes = {
  roomName: '',
};

RoomChatShare.propTypes = {
  roomName: PropTypes.string,
};


export default RoomChatShare;
