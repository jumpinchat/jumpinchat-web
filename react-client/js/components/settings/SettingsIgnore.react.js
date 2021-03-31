import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BanListItem from '../room/BanlistModal/BanlistItem.react';
import { unignoreUser } from '../../utils/RoomAPI';

class SettingsIgnore extends Component {
  constructor() {
    super();
    this.unignoreUser = unignoreUser;
  }

  render() {
    const { settings: { ignoreList } } = this.props;
    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Ignore list</h2>
        <div className="banlist__List">
          {ignoreList.length > 0 && ignoreList.map(listItem => (
            <BanListItem
              removeLabel="Unignore"
              onRemove={() => this.unignoreUser(listItem.id)}
              item={listItem}
              key={listItem.id}
            />
          ))}

          {ignoreList.length === 0 && (
            <div className="banlist__Empty">
              <img src="../img/no_data.svg" alt="" className="banlist__EmptyImg" />
              <span className="banlist__EmptyLabel">Ignore list empty.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

SettingsIgnore.propTypes = {
  settings: PropTypes.shape({
    ignoreList: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
};

export default SettingsIgnore;
