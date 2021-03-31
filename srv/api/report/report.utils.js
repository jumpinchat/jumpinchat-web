const moment = require('moment');
const log = require('../../utils/logger.util')({ name: 'report.utils' });
const config = require('../../config/env');
const email = require('../../config/email.config');
const Queue = require('../../utils/queue.util');
const redis = require('../../lib/redis.util')();
const reportModel = require('./report.model');
const adminUtils = require('../admin/admin.utils');
const adminConstants = require('../admin/admin.constants');
const {
  reportTemplate,
  siteModReportTemplate,
} = require('../../config/constants/emailTemplates');
const userUtils = require('../user/user.utils');

function getLimiterKey(sessionId) {
  return `reportLimit:${sessionId}`;
}

module.exports.getReportById = function getReportById(reportId) {
  return reportModel.findOne({ _id: reportId }).exec();
};

module.exports.incrementReport = async function incrementReport(session, cb) {
  const key = getLimiterKey(session);
  return redis.get(key, (err, current) => {
    if (err) {
      return cb(err);
    }

    if (current && current >= config.report.limit) {
      return redis.ttl(key, (err, ttl) => {
        if (err) {
          log.fatal({ err }, 'failed to get TTL');
          return cb(err);
        }

        log.warn('User has hit report limit');
        return cb({
          name: 'ERR_LIMIT',
          ttl,
        });
      });
    }

    return redis.incr(key, (err) => {
      if (err) {
        return cb(err);
      }

      return redis.expire(key, config.report.limitExpire, (err) => {
        if (err) {
          return cb(err);
        }

        return cb();
      });
    });
  });
};

module.exports.getTimeLeft = function getTimeLeft(ttl) {
  return moment.duration(ttl, 'seconds').humanize();
};

module.exports.sendReportMessages = function sendReportMessages(body, roomName) {
  return new Promise(async (resolve, reject) => {
    const queue = new Queue(email.sendMail, 100);

    queue.on('done', () => {
      log.debug('email send queue complete');
    });

    let mods;
    try {
      mods = await userUtils.getSiteMods();
    } catch (err) {
      log.fatal({ err }, 'failed to get site mods');
      return reject(err);
    }

    mods.forEach((mod) => {
      const cb = (err) => {
        if (err) {
          log.error({ err, username: mod.username }, 'error sending email');
          return;
        }
      };

      let html;
      if (mod.attrs.userLevel === 30) {
        html = reportTemplate(body);
      }

      if (mod.attrs.userLevel === 20) {
        html = siteModReportTemplate(body);
      }

      const emailOpts = {
        to: mod.auth.email,
        subject: `User report: ${roomName} - ${String(body._id)}`,
        html,
      };

      const args = [emailOpts, cb];
      queue.addToQueue(args);
    });

    return resolve();
  });
};

module.exports.resolveReport = function resolveReport(reportId, user, outcome) {
  return new Promise(async (resolve, reject) => {
    let report;
    try {
      report = await reportModel.findOne({ _id: reportId }).exec();
    } catch (err) {
      log.fatal({ err }, 'failed to get report');
      return reject(err);
    }

    if (!report) {
      const error = new Error();
      error.name = 'MissingValueError';
      error.message = 'Report not found';
      return reject(error);
    }

    report.resolution = {
      resolved: true,
      resolvedBy: user,
      resolvedAt: Date.now(),
      outcome,
    };

    let updatedReport;
    try {
      updatedReport = await report.save();
    } catch (err) {
      return reject(err);
    }

    try {
      const action = {
        type: adminConstants.activity.REPORT_RESOLUTION,
        id: String(updatedReport._id),
      };

      await adminUtils.addModActivity(user, action);
    } catch (err) {
      log.fatal({ err }, 'error adding acitivity entry');
      return reject(err);
    }

    return resolve(updatedReport);
  });
};
