const Joi = require('joi');
const reportModel = require('../report.model');
const reportUtils = require('../report.utils');
const roomUtils = require('../../room/room.utils');
const errors = require('../../../config/constants/errors');
const log = require('../../../utils/logger.util')({ name: 'addReport' });
const SlackBot = require('../../../utils/slack.util');
const {
  getRemoteIpFromReq,
  uploadDataUriToS3,
} = require('../../../utils/utils');
const config = require('../../../config/env');

const slackBot = new SlackBot(
  config.slack.hookUrl,
  'Mod Bot',
  'https://s3.amazonaws.com/jic-assets/trophies/trophy-site-mod.jpg',
  '#reports',
);

module.exports = function addReport(req, res) {
  const schema = Joi.object().keys({
    reporterId: Joi.string().required(),
    targetId: Joi.string().required(),
    room: Joi.string().required(),
    reason: Joi.string().required(),
    description: Joi.string().max(140).allow(''),
    screenshotUri: Joi.string().allow(null),
    messages: Joi.array().items(Joi.object()),
    privateMessages: Joi.array().items(Joi.object()),
  });

  Joi.validate(req.body, schema, { abortEarly: false }, (err, validated) => {
    if (err) {
      const message = err.details.map(d => d.message).join('\n');
      return res.status(400).send(Object.assign(errors.ERR_INVALID_BODY, { message }));
    }

    const ip = getRemoteIpFromReq(req);
    const {
      reporterId,
      targetId,
      room,
      reason,
      description,
      screenshotUri,
      messages,
      privateMessages,
    } = validated;

    return roomUtils.getRoomByName(room, (err, roomObj) => {
      if (err) {
        log.fatal({ err, room }, 'error getting room');
        return res.status(500).send(errors.ERR_SRV);
      }

      if (!roomObj) {
        log.error({ room }, 'room does not exist');
        return res.status(404).send(errors.ERR_NO_ROOM);
      }

      const targetUser = roomObj.users.find(u => String(u._id) === targetId);
      const reportingUser = roomObj.users.find(u => String(u._id) === reporterId);

      if (!reportingUser) {
        log.error({ reporterId }, 'reporting user missing');
        return res.status(400).send(errors.ERR_NO_USER);
      }

      reportUtils.incrementReport(reportingUser.session_id, async (err) => {
        if (err) {
          if (err.name === 'ERR_LIMIT') {
            return res.status(429).send({
              error: err.name,
              message: `You have sent too many reports. Please do not abuse the reporting system, or you may be banned. Wait ${reportUtils.getTimeLeft(err.ttl)}`,
            });
          }

          return res.status(500).send(errors.ERR_SRV);
        }

        if (!targetUser) {
          log.error({ room, targetId }, 'target user does not exist');
          return res.status(404).send(errors.ERR_NO_USER_LIST_ID);
        }

        let targetUserFingerprint;

        try {
          const targetCache = await roomUtils.getSocketCacheInfo(targetUser.socket_id);
          if (!targetCache) {
            log.warn({ socketId: targetUser.socket_id }, 'no cache data for target');
          } else {
            targetUserFingerprint = targetCache.fingerprint;
          }
        } catch (err) {
          log.fatal({ err }, 'failed to get cache data');
        }

        if (!reportingUser) {
          log.error({ room, reporterId }, 'reporting user does not exist');
          return res.status(404).send(errors.ERR_NO_USER_LIST_ID);
        }

        const screenshotFileName = `${Date.now()}.${targetUser._id}.jpg`;

        uploadDataUriToS3(screenshotFileName, screenshotUri, (err, url) => {
          if (err) {
            log.fatal({ err }, 'error uploading report screenshot');
            return res.status(500).send(errors.ERR_SRV);
          }

          log.debug({ url }, 'uploaded screenshot successfully');

          const report = {
            reason,
            description,
            room: {
              name: roomObj.name,
              roomId: roomObj._id,
            },
            target: {
              ip: targetUser.ip,
              handle: targetUser.handle,
              userListId: targetId,
              userId: targetUser.user_id,
              sessionId: targetUser.session_id,
              socketId: targetUser.socket_id,
              fingerprint: targetUserFingerprint,
            },
            reporter: {
              ip,
              handle: reportingUser.handle,
              userListId: reporterId,
              userId: reportingUser.user_id,
              sessionId: reportingUser.session_id,
              socketId: targetUser.socket_id,
            },
            log: {
              body: {
                screenshot: url,
                chat: messages,
                privateMessages,
              },
            },
          };

          return reportModel.create(report, async (err, createdReport) => {
            if (err) {
              log.fatal({ err }, 'failed to save report');
              return res.status(500).send(errors.ERR_SRV);
            }

            const text = 'User report';
            const attachments = [
              {
                fallback: text,
                title: text,
                title_link: `https://jumpin.chat/admin/reports/${createdReport._id}`,
                fields: [
                  {
                    title: 'Reason',
                    value: report.reason,
                    short: true,
                  },
                  {
                    title: 'Room',
                    value: `<https://jumpin.chat/admin/rooms/${report.room.name}|${report.room.name}>`,
                    short: true,
                  },
                  {
                    title: 'Reporter',
                    value: report.reporter.handle,
                    short: true,
                  },
                  {
                    title: 'Target',
                    value: report.target.handle,
                    short: true,
                  },
                ],
                ts: Date.now() / 1000,
              },
            ];

            try {
              await slackBot.message(attachments);
            } catch (err) {
              log.error({ err }, 'failed to send slack message');
            }

            try {
              await reportUtils.sendReportMessages(createdReport, roomObj.name);
            } catch (err) {
              log.fatal({ err }, 'failed to send report messages');
            }

            return res.status(201).send();
          });
        });
      });
    });
  });
};
