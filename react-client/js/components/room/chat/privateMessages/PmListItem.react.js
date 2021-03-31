import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import chatStore from '../../../../stores/ChatStore/ChatStore';
import PmListItemOptions from './PmListItemOptions.react';

class PmListItem extends Component {
  constructor() {
    super();
    this.getHandleByUserId = chatStore.getHandleByUserId.bind(chatStore);
    this.handleOpenMenu = this.handleOpenMenu.bind(this);
  }

  handleOpenMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.openMenu(this.props.user.userListId);
  }

  render() {
    const {
      user: {
        userListId,
      },
      selectConversation,
      selectedConversation,
      unreadMessages,
      menuOpen,
      handleClickOutside,
      closeConversation,
      disabled,
    } = this.props;

    const handle = this.getHandleByUserId(userListId);

    return (
      <div
        className={classnames('chat__UserListItem', {
          'chat__UserListItem--disabled': disabled,
        })}
        onClick={() => selectConversation(userListId)}
        role="button"
        tabIndex="-1"
      >
        <div
          className={classnames('userList__UserHandle', {
            'userList__UserHandle-current': selectedConversation === userListId,
          })}
        >
          {handle}
        </div>

        {unreadMessages > 0 && (
          <div className="pill pill--blue">{unreadMessages}</div>
        )}

        <PmListItemOptions
          menuOpen={menuOpen}
          handle={handle}
          userListId={userListId}
          onOpenMenu={this.handleOpenMenu}
          handleClickOutside={handleClickOutside}
          closeConversation={closeConversation}
        />
      </div>
    );
  }
}

PmListItem.defaultProps = {
  selectedConversation: null,
  menuOpen: null,
  disabled: false,
};

PmListItem.propTypes = {
  user: PropTypes.shape({
    userListId: PropTypes.string.isRequired,
  }).isRequired,
  unreadMessages: PropTypes.number.isRequired,
  selectedConversation: PropTypes.string,
  selectConversation: PropTypes.func.isRequired,
  menuOpen: PropTypes.string,
  disabled: PropTypes.bool,
  openMenu: PropTypes.func.isRequired,
  handleClickOutside: PropTypes.func.isRequired,
  closeConversation: PropTypes.func.isRequired,
};

export default PmListItem;
