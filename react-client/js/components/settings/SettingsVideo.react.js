import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setQuality } from '../../actions/CamActions';
import { Radio, RadioContainer } from './controls/Radio.react';

class SettingsVideo extends Component {
  constructor() {
    super();
    this.setQuality = setQuality;
    this.handleChangeFeedQuality = this.handleChangeFeedQuality.bind(this);
  }

  handleChangeFeedQuality(e) {
    const { value } = e.target;
    const { settings: { allFeedsHd } } = this.props;
    this.setQuality(value === 'false' ? 0 : 2);
  }

  render() {
    const { settings } = this.props;
    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Audio and Video</h2>

        <RadioContainer
          name="theme"
          onChange={this.handleChangeFeedQuality}
          value={settings.allFeedsHd}
          title="HD feeds"
        >
          <Radio label="High quality video" value={true} />
          <Radio label="Lower quality video" value={false} />
        </RadioContainer>
        <span className="text-sub">Only applies to feeds broadcasted in HD</span>
      </div>
    );
  }
}

SettingsVideo.propTypes = {
  settings: PropTypes.shape({
    allFeedsHd: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SettingsVideo;
