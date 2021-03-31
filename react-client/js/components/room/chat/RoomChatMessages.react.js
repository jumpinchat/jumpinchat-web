import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import RoomChatMessage from './RoomChatMessage.react';
import ScrollResume from '../../elements/ScrollResume.react';

class RoomChatMessages extends Component {
  constructor(props) {
    super(props);
    this.handleResumeScroll = this.handleResumeScroll.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.context.scrollArea.scrollBottom();
    });
  }

  componentDidUpdate(prevProps) {
    const { messages, fixScroll } = this.props;
    const oldMessages = prevProps.messages.map(m => m.id).join('');
    const newMessages = messages.map(m => m.id).join('');
    const hasNewMessages = oldMessages !== newMessages;

    if (hasNewMessages && !fixScroll) {
      setTimeout(() => {
        this.context.scrollArea.scrollBottom();
      });
    }
  }

  handleResumeScroll() {
    const { setScrollFixed } = this.props;
    const { scrollBottom } = this.context.scrollArea;
    setScrollFixed(false);
    scrollBottom();
  }

  render() {
    const {
      messages,
      currentUser,
      fixScroll,
    } = this.props;

    return (
      <Fragment>
        {messages.map(message => (
          <RoomChatMessage
            message={message}
            key={message.id}
            username={currentUser && currentUser.username}
            handle={currentUser && currentUser.handle}
          />
        ))}
        <ScrollResume
          onResume={this.handleResumeScroll}
          visible={fixScroll}
        />
      </Fragment>
    );
  }
}

RoomChatMessages.defaultProps = {
  messages: [],
  currentUser: {},
};

RoomChatMessages.propTypes = {
  messages: PropTypes.array,
  currentUser: PropTypes.shape({
    username: PropTypes.string,
    handle: PropTypes.string,
  }),
  fixScroll: PropTypes.bool.isRequired,
  setScrollFixed: PropTypes.func.isRequired,
};

RoomChatMessages.contextTypes = {
  scrollArea: PropTypes.shape({
    scrollBottom: PropTypes.func.isRequired,
  }).isRequired,
};

export default RoomChatMessages;
