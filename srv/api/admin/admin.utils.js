const moment = require('moment');
const request = require('request');
const { groupBy } = require('lodash');
const config = require('../../config/env');
const log = require('../../utils/logger.util')({ name: 'adminUtils' });
const redis = require('../../lib/redis.util')();
const StatsModel = require('./stats.model');
const SiteModModel = require('./sitemod.model');
const ModActivityModel = require('./modActivity.model');

const statsKey = 'stats';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStubData(length) {
  const data = [];
  for (let i = length; i >= 0; i -= 1) {
    data.push({
      x: new Date(Date.now() - (1000 * 60 * 15 * i)).toISOString(),
      y: getRandomIntInclusive(0, 50),
    });
  }

  return data;
}

function getStubStats() {
  const data = [];
  const length = 2688;

  for (let i = length; i >= 0; i -= 1) {
    data.push({
      createdAt: new Date(Date.now() - (1000 * 60 * 15 * i)).toISOString(),
      rooms: [{
        name: 'foo',
        users: getRandomIntInclusive(0, 15),
        broadcasters: getRandomIntInclusive(0, 10),
      }],
    });
  }

  return data;
}

module.exports.formatData = function formatData(data) {
  const userData = data.map(s => ({
    x: s.createdAt,
    y: s.rooms.reduce((acc, r) => acc += r.users, 0),
  }));

  const broadcasterData = data.map(s => ({
    x: s.createdAt,
    y: s.rooms.reduce((acc, r) => acc += r.broadcasters, 0),
  }));

  return [userData, broadcasterData];
};

function mergeData(data, unit) {
  const groupedResults = groupBy(data, ({ x }) => moment(x).startOf(unit));

  return Object.entries(groupedResults)
    .map(([label, groupedData]) => {
      const sum = groupedData.reduce((acc, { y }) => acc += y, 0);
      const avg = (sum > 0 && data.length > 0)
        ? sum / groupedData.length
        : 0;

      return {
        x: new Date(label).toISOString(),
        y: Math.round(avg),
      };
    });
}

function getLimitedData(data, limit) {
  return data
    .map(d => d.slice(limit * -1));
}

module.exports.getStats = function getStats() {
  const diff = 1000 * 60 * 60 * 24 * 7 * 4;
  const limit = new Date(Date.now() - diff);

  if (config.env === 'development') {
    return getStubStats();
  }

  return StatsModel
    .find({
      createdAt: {
        $gte: limit,
      },
    })
    .exec();
};

module.exports.getStatsDay = function getStatsDay(stats) {
  const limit = 96;

  const limitedStats = getLimitedData(stats, limit);
  return limitedStats.map(v => mergeData(v, 'hour'));
};

module.exports.getStatsWeek = function getStatsWeek(stats) {
  const limit = 672;

  const limitedStats = getLimitedData(stats, limit);
  return limitedStats.map(v => mergeData(v, 'day'));
};

module.exports.getStatsMonth = function getStatsMonth(stats) {
  const limit = 2688;

  const limitedStats = getLimitedData(stats, limit);
  return limitedStats.map(v => mergeData(v, 'day'));
};

module.exports.setStatsInCache = function setStatsInCache(stats) {
  return new Promise((resolve, reject) => {
    try {
      const statsString = JSON.stringify(stats);
      return redis.set(statsKey, statsString, (err) => {
        if (err) {
          log.fatal({ err }, 'failed to set stats');
          return reject(err);
        }

        return redis.expire(statsKey, config.admin.stats.ttl, (err) => {
          if (err) {
            log.fatal({ err }, 'failed to set stats');
            return reject(err);
          }

          return resolve();
        });
      });
    } catch (err) {
      log.fatal({ err }, 'failed to stringify stats');
      return reject(err);
    }
  });
};

module.exports.getStatsFromCache = function getStatsFromCache() {
  return new Promise((resolve, reject) => redis.ttl(statsKey, (err, ttl) => {
    if (err) {
      log.fatal({ err }, 'failed to get stats');
      return reject(err);
    }

    if (ttl === -2) {
      log.debug('stats have expired, skipping');
      return resolve();
    }

    return redis.get(statsKey, (err, stats) => {
      if (err) {
        log.fatal({ err }, 'failed to get stats');
        return reject(err);
      }

      try {
        const parsedStats = JSON.parse(stats);
        return resolve(parsedStats);
      } catch (err) {
        log.fatal({ err }, 'failed to parse stats');
        return reject(err);
      }
    });
  }));
};

module.exports.addSiteMod = function addSiteMod(sitemod) {
  return SiteModModel.create(sitemod);
};

module.exports.removeSiteMod = function removeSiteMod(id) {
  return SiteModModel.deleteOne({ _id: id });
};

module.exports.getSiteModById = function getSiteModById(modId) {
  return SiteModModel
    .findOne({ _id: modId })
    .exec();
};

module.exports.getSiteMods = function getSiteMods() {
  return SiteModModel
    .find({})
    .populate({
      path: 'user',
      select: ['username', 'profile.pic'],
    })
    .populate({
      path: 'addedBy',
      select: ['username', 'profile.pic'],
    })
    .exec();
};

module.exports.addModActivity = function addModActivity(user, action) {
  const activityItem = {
    user,
    action,
  };

  return ModActivityModel.create(activityItem);
};

module.exports.getModActivityCount = function getModActivityCount() {
  return ModActivityModel.countDocuments({}).exec();
};

module.exports.getModActivity = function getModActivity(start, end) {
  return ModActivityModel
    .find({})
    .skip(start)
    .limit(end)
    .sort({ createdAt: -1 })
    .populate({
      path: 'user',
      select: ['username', 'profile.pic'],
    })
    .exec();
};
