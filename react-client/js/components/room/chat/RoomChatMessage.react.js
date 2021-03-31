/**
 * Created by Zaccary on 21/06/2015.
 */


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import FormattedMessage from './FormattedMessage/FormattedMessage.react';
import { withState } from '../../../utils/withState';
import { setChatInputValue } from '../../../actions/ChatActions';
import { getUserMentioned, getRoleMentioned } from '../../../utils/chatUtils';
import Timestamp from './RoomChatMessageTimestamp';

export class RoomChatMessage extends Component {
  constructor(props) {
    super(props);
    this.setChatInputValue = setChatInputValue;
    this.handleClickHandle = this.handleClickHandle.bind(this);
  }

  handleClickHandle() {
    const { message } = this.props;
    this.setChatInputValue(`@${message.handle}: `);
  }

  render() {
    const {
      message,
      handle,
      username,
      userState: {
        user: {
          roles,
        },
      },
    } = this.props;

    if (message.status) {
      const cx = classnames('chat__MessageBody', {
        'chat__MessageBody-error': message.error,
        'chat__MessageBody-info': message.type === 'info',
        'chat__MessageBody-success': message.type === 'success',
        'chat__MessageBody-alert': message.type === 'alert',
        'chat__MessageBody-warning': message.type === 'warning',
        'chat__MessageBody-status': !message.color,
        'chat__MessageBody-history': message.history,
      });

      return (
        <div
          className={classnames('chat__Message', { [message.color]: !!message.color })}
        >
          <div className={cx}>
            {message.message}
          </div>
          <Timestamp timestamp={message.timestamp} />
        </div>
      );
    }

    const userMentioned = getUserMentioned(message.message, handle, username);
    const roleMentioned = roles.some(role => getRoleMentioned(message.message, role));
    const cx = classnames('chat__MessageBody', {
      'chat__MessageBody-userHighlight': userMentioned || roleMentioned,
    });

    return (
      <div
        className={classnames('chat__Message', { [message.color]: !!message.color })}
      >
        <div className={cx}>
          <span
            role="link"
            tabIndex="-1"
            className="chat__MessageHandle"
            onClick={this.handleClickHandle}
          >
            <strong>{message.handle}</strong>
            {message.isAdmin && (
              <span className="badge badge--blue">admin</span>
            )}
            {message.isSiteMod && !message.isAdmin && (
              <span className="badge badge--blue">site mod</span>
            )}
          </span>
          <FormattedMessage text={message.message} />
        </div>
        <Timestamp timestamp={message.timestamp} />
      </div>
    );
  }
}

RoomChatMessage.defaultProps = {
  message: null,
  handle: null,
  username: null,
};

RoomChatMessage.propTypes = {
  message: PropTypes.shape({
    message: PropTypes.string,
    timestamp: PropTypes.string,
    handle: PropTypes.string,
    color: PropTypes.string,
    isAdmin: PropTypes.bool,
    isSiteMod: PropTypes.bool,
    status: PropTypes.bool,
    type: PropTypes.string,
    history: PropTypes.bool,
    error: PropTypes.bool,
  }),
  userState: PropTypes.shape({
    user: PropTypes.shape({
      roles: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  }).isRequired,
  handle: PropTypes.string,
  username: PropTypes.string,
};

export default React.memo(withState(RoomChatMessage));
