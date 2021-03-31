const path = require('path');
const request = require('request');
const user = require('./api/user');
const room = require('./api/room');
const janus = require('./api/janus');
const turn = require('./api/turn');
const admin = require('./api/admin');
const youtube = require('./api/youtube');
const report = require('./api/report');
const trophy = require('./api/trophy');
const message = require('./api/message');
const ageVerification = require('./api/ageVerification');
const payment = require('./api/payment');
const role = require('./api/role');
const config = require('./config/env');
const roomUtils = require('./api/room/room.utils');
const log = require('./utils/logger.util')({ name: 'routes' });

module.exports = function routes(app) {
  app.use('/api/user', user);
  app.use('/api/rooms', room);
  app.use('/api/janus', janus);
  app.use('/api/turn', turn);
  app.use('/api/admin', admin);
  app.use('/api/youtube', youtube);
  app.use('/api/report', report);
  app.use('/api/trophy', trophy);
  app.use('/api/ageverify', ageVerification);
  app.use('/api/payment', payment);
  app.use('/api/message', message);
  app.use('/api/role', role);

  app.get('/api/status', (req, res) => res.status(200).send('It\'s all good'));
  app.post('/api/donate', (req, res) => {
    try {
      const data = JSON.parse(req.body.data);

      const {
        from_name: fromName,
        message: msg,
        amount,
      } = data;

      const slackHookUrl = 'https://hooks.slack.com/services/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';
      const text = `${fromName} donated $${amount}`;
      const payload = {
        username: 'Ko-fi',
        channel: '#general',
        icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2018-05-20/367806459094_6a252d08d5880d6ba7ed.png',
        attachments: [
          {
            pretext: text,
            fallback: text,
          },
        ],
      };

      if (msg) {
        payload.attachments[0].fields = [
          {
            title: 'Message',
            value: msg,
          },
        ];
      }

      const requestOptions = {
        method: 'POST',
        url: slackHookUrl,
        body: payload,
        json: true,
      };

      return request(requestOptions, (err, response, body) => {
        if (err) {
          log.fatal({ err }, 'error posting slack webhook');
          return res.status(500).send();
        }

        if (response.statusCode >= 400) {
          log.fatal({ statusCode: response.statusCode }, 'error posting slack webhook');
          return res.status(response.statusCode).send();
        }

        res.status(200).send();
      });
    } catch (e) {
      log.fatal({ err: e }, 'error parsing body');
      return res.status(400).send();
    }
  });

  app.route('/favicon.ico')
    .get((req, res, next) => {
      log.debug('favicon', req.url);
      next();
    });

  app.route('/register')
    .get((req, res) => {
      res.render('register');
    });

  app.route('/login')
    .get((req, res) => {
      res.render('login');
    });


  app.route(`/:room(${config.roomRegExp})/manifest.json`)
    .get((req, res) => {
      const roomName = req.params.room;
      const manifest = {
        short_name: roomName,
        name: `${roomName} | JumpInChat`,
        icons: [
          {
            src: '/img/jic-logo-144x144.png',
            type: 'image/png',
            sizes: '144x144',
          },
          {
            src: '/img/jic-logo-192x192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/img/jic-logo-512x512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        start_url: `/${roomName}/?utm_source=${roomName}&utm_medium=homescreen`,
        background_color: '#22ADD5',
        theme_color: '#22ADD5',
        display: 'standalone',
      };

      try {
        return res.status(200).send(JSON.stringify(manifest));
      } catch (err) {
        log.fatal({ err }, 'Error creating manifest');
        return res.status(500).send();
      }
    });

  app.route(`/:room(${config.roomRegExp})`).post((req, res) => res.redirect(req.path));

  app.route(`/:room(${config.roomRegExp})`)
    .get((req, res, next) => {
      const roomName = req.params.room.toLowerCase().replace('-', '');

      if (req.params.room.match(/[A-Z-]/)) {
        return res.status(301).redirect(roomName);
      }

      log.debug({ roomName }, 'connecting to room');

      if (roomName !== 'socket.io-client' && roomName !== 'api') {
        log.debug({ roomName }, 'rendering room');

        const roomTitle = `${roomName} | JumpInChat`;

        roomUtils.getRoomByName(roomName, (err, existingRoom) => {
          if (err) {
            log.fatal({ err, room: roomName }, 'error getting room');
            return res.status(500).redirect('/500');
          }

          let roomObj = existingRoom;

          if (!roomObj) {
            roomObj = {
              name: roomName,
              settings: {},
            };
          }

          let roomDescription = 'JumpInChat is a free and simple way to create video chat rooms. No downloads, no Flash, just your Browser! Find a chat room or create your own and start chatting instantly!';

          let roomDisplay = 'https://jumpin.chat/images/jiclogo_320x320.png';

          if (roomObj.settings.description) {
            roomDescription = `JumpInChat: Simple video chat rooms | ${roomObj.settings.description}`;
          }

          if (roomObj.settings.display) {
            roomDisplay = `https://s3.amazonaws.com/jic-uploads/${roomObj.settings.display}`;
          }

          return res.render(path.join(config.root, config.appPath, 'index.ejs'),
            {
              roomTitle,
              roomDisplay,
              roomDescription,
              room: roomObj,
              gaId: config.analytics.ga,
              fbId: config.analytics.fb,
            }, (err, html) => {
              if (err) {
                log.fatal({ err }, 'error rendering room');
              }

              return res.status(200).send(html);
            });
        });
      } else {
        return next();
      }
    });

  app.route('*')
    .get((req, res, next) => {
      res.status(404);

      log.debug({ url: req.originalUrl }, 'route not found');

      if (req.accepts('html')) {
        return res.render('404');
      }

      if (req.accepts('json')) {
        return res.send({ error: 'route not found' });
      }

      return next();
    });
};
