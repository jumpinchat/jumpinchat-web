import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { layouts } from '../../constants/RoomConstants';
import { setTheme } from '../../actions/UserActions';
import { setLayout } from '../../actions/AppActions';
import { setChatColor } from '../../utils/RoomAPI';
import { Radio, RadioContainer } from './controls/Radio.react';
import ColorPicker from './controls/ColorPicker.react';

const ChatPreview = ({ color, theme }) => {
  const messages = [
    'Look at me, I\'m a message',
    `Embrace the ${theme === 'light' ? 'light' : 'darkness'}`,
  ];
  return (
    <div className="settings__ChatPreview">
      {messages.map(message => (
        <div key={message} className={`chat__Message ${color}`}>
          <div className="chat__MessageBody">
            <span className="chat__MessageHandle">
              <strong>handle</strong>
            </span>
            <span>{message}</span>
          </div>
          <div className="chat__MessageTimestamp">{new Date().toLocaleTimeString().replace(/:\d{2}$/, '')}</div>
        </div>
      ))}
    </div>
  );
};

ChatPreview.propTypes = {
  color: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
};

class SettingsAppearance extends Component {
  constructor() {
    super();
    this.setChatColor = setChatColor;
    this.setTheme = setTheme;
    this.setLayout = setLayout;
    this.handleChangeTheme = this.handleChangeTheme.bind(this);
    this.handleChangeLayout = this.handleChangeLayout.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
  }

  handleChangeTheme(e) {
    const { value } = e.target;
    const darkTheme = value === 'dark';
    this.setTheme(darkTheme);
  }

  handleChangeLayout(e) {
    const { value } = e.target;
    this.setLayout(value);
  }

  handleChangeColor(color) {
    this.setChatColor(color);
  }

  render() {
    const { settings, chatColors } = this.props;
    return (
      <div className="settings__Page">
        <h2 className="settings__PageTitle">Appearance</h2>
        <ChatPreview
          color={settings.chatColor}
          theme={settings.darkTheme ? 'dark' : 'light'}
        />

        <RadioContainer
          name="theme"
          onChange={this.handleChangeTheme}
          value={settings.darkTheme ? 'dark' : 'light'}
          title="Theme"
        >
          <Radio label="Dark theme" value="dark" />
          <Radio label="Light theme" value="light" />
        </RadioContainer>

        <RadioContainer
          name="layout"
          onChange={this.handleChangeLayout}
          value={settings.layout}
          title="Layout"
        >
          <Radio label="Wide layout" value={layouts.HORIZONTAL} />
          <Radio label="Vertical layout" value={layouts.VERTICAL} />
        </RadioContainer>


        <h3 className="settings__Title">Chat color</h3>
        <ColorPicker
          colors={chatColors}
          activeColor={settings.chatColor}
          onChange={this.handleChangeColor}
        />
      </div>
    );
  }
}

SettingsAppearance.propTypes = {
  settings: PropTypes.shape({
    darkTheme: PropTypes.bool.isRequired,
    chatColor: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
  }).isRequired,
  chatColors: PropTypes.arrayOf(PropTypes.string).isRequired,
};


export default SettingsAppearance;
