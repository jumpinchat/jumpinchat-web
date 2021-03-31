const adminUtils = require('../admin.utils');
const log = require('../../../utils/logger.util')({ name: 'admin.getStats' });

module.exports = async function getStats(req, res) {
  let stats;

  try {
    stats = await adminUtils.getStatsFromCache();
  } catch (err) {
    log.fatal({ err }, 'failed to fetch stats from cache');
    return res.status(500).send(err);
  }

  try {
    if (!stats) {
      log.debug('stats not cached, fetching');
      const rawStats = await adminUtils.getStats();

      const formattedStats = adminUtils.formatData(rawStats);

      const dayStats = adminUtils.getStatsDay(formattedStats);
      const weekStats = adminUtils.getStatsWeek(formattedStats);
      const monthStats = adminUtils.getStatsMonth(formattedStats);
      stats = {
        day: dayStats,
        week: weekStats,
        month: monthStats,
      };
      await adminUtils.setStatsInCache(stats);
    } else {
      log.info('stats cached');
    }
  } catch (err) {
    log.fatal({ err }, 'failed to get stats');
    return res.status(500).send(err);
  }

  log.debug({ stats: stats.length }, 'got stats');


  return res.status(200).send(stats);
};
