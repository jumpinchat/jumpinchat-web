import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '../elements/Switch.react';

import { setPlayVideos } from '../../actions/UserActions';

class SettingsMedia extends Component {
  constructor() {
    super();
    this.setPlayVideos = setPlayVideos;
    this.handleChangePlayVideos = this.handleChangePlayVideos.bind(this);
  }

  handleChangePlayVideos() {
    const {
      settings: { playYoutubeVideos },
    } = this.props;
    this.setPlayVideos(!playYoutubeVideos);
  }

  render() {
    const { settings } = this.props;
    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Media</h2>
        <Switch
          label="Play videos"
          checked={settings.playYoutubeVideos}
          onChange={this.handleChangePlayVideos}
          helpText="Whether the videos, e.g. YouTube, played by other users will appear for you"
        />
      </div>
    );
  }
}

SettingsMedia.propTypes = {
  settings: PropTypes.shape({
    playYoutubeVideos: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SettingsMedia;
