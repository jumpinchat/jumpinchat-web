import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TextInput from './controls/TextInput.react';
import { setTopic } from '../../utils/RoomAPI';
import { setSettingsError } from '../../actions/AppActions';

class SettingsRoomInfo extends Component {
  constructor() {
    super();
    this.state = {
      changed: {
        topic: false,
      },
    };
    this.setTopic = setTopic;
    this.setSettingsError = setSettingsError;
    this.handleChangeTopic = this.handleChangeTopic.bind(this);
    this.handleSubmitTopic = this.handleSubmitTopic.bind(this);
  }

  handleChangeTopic(e) {
    const {
      settings: {
        topic: {
          text: topic,
        },
      },
    } = this.props;
    const { value } = e.target;

    this.setState({
      changed: {
        topic: value !== topic,
      },
    });
  }

  handleSubmitTopic(e) {
    e.preventDefault();
    this.setState({
      changed: {
        topic: false,
      },
    });
    this.setSettingsError({ modal: 'settings.room.info.topic', message: null });
    this.setTopic(this.topic.value);
  }

  render() {
    const { changed } = this.state;
    const { settings, errors, room } = this.props;
    const subTitle = settings.topic.updatedBy
      ? `Set by ${settings.topic.updatedBy.username} ${moment(settings.topic.updatedAt).calendar()}`
      : null;
    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Room Info</h2>
        <TextInput
          defaultValue={settings.topic.text}
          onSubmit={this.handleSubmitTopic}
          onChange={this.handleChangeTopic}
          label="Topic"
          ref={(e) => { this.topic = e; }}
          changed={changed.topic}
          error={errors.topic}
          subTitle={subTitle}
          id="topic"
        />

        <h3 className="settings__Title">Emoji</h3>
        <p>
          Add custom emoji in the
          {' '}
          <a href={`${room.name}/settings`} target="_blank">room settings page</a>
        </p>
      </div>
    );
  }
}

SettingsRoomInfo.defaultProps = {
  errors: {
    topic: null,
  },
};

SettingsRoomInfo.propTypes = {
  settings: PropTypes.shape({
    topic: PropTypes.shape({
      text: PropTypes.string,
      updatedBy: PropTypes.shape({
        username: PropTypes.string,
      }),
      updatedAt: PropTypes.string,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.shape({
    topic: PropTypes.string,
  }),
  room: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default SettingsRoomInfo;
