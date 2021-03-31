import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BanListItem from '../room/BanlistModal/BanlistItem.react';
import { sendOperatorAction } from '../../utils/RoomAPI';

class SettingsBanlist extends Component {
  constructor(props) {
    super();
    this.sendOperatorAction = props.sendOperatorAction || sendOperatorAction;
  }

  componentDidMount() {
    this.sendOperatorAction('banlist');
  }

  handleUnbanUser(banlistId, handle) {
    this.sendOperatorAction('unban', {
      banlistId,
      handle,
    });
  }

  render() {
    const {
      settings: {
        banlist,
      },
    } = this.props;

    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Ban list</h2>
        <div className="banlist__List">
          {banlist.length > 0 && banlist.map(listItem => (
            <BanListItem
              removeLabel="Unban"
              onRemove={() => this.handleUnbanUser(listItem._id, listItem.handle)}
              item={listItem}
              key={listItem._id}
            />
          ))}

          {banlist.length === 0 && (
            <div className="banlist__Empty">
              <img src="../img/no_data.svg" alt="" className="banlist__EmptyImg" />
              <span className="banlist__EmptyLabel">Ban list empty.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

SettingsBanlist.propTypes = {
  sendOperatorAction: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    banlist: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      username: PropTypes.string,
    })).isRequired,
  }).isRequired,
};

export default SettingsBanlist;
