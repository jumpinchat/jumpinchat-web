const request = require('request');
const log = require('./logger.util')({ name: 'SlackBot' });

class SlackBot {
  constructor(url, username, icon, channel = '#general') {
    this.url = url;
    this.username = username;
    this.channel = channel;
    this.icon = icon;
  }

  message(attachments) {
    const payload = {
      username: this.username,
      channel: this.channel,
      icon_url: this.icon,
      attachments,
    };

    const requestOptions = {
      method: 'POST',
      url: this.url,
      body: payload,
      json: true,
    };

    return new Promise((resolve, reject) => request(requestOptions, (err, response) => {
      if (err) {
        log.fatal({ err }, 'error posting slack webhook');
        return reject(err);
      }

      if (response.statusCode >= 400) {
        log.fatal({ statusCode: response.statusCode }, 'error posting slack webhook');
        return reject(response.statusCode);
      }

      return resolve();
    }));
  }
}

module.exports = SlackBot;
