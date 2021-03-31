const log = require('../../../utils/logger.util')({ name: 'getReportById' });
const reportModel = require('../report.model');
const errors = require('../../../config/constants/errors');

module.exports = function getReports(req, res) {
  const { reportId } = req.params;

  return reportModel
    .findOne({ _id: reportId })
    .where('active').equals(true)
    .populate({
      path: 'resolution.resolvedBy',
      select: ['username', 'profile.pic'],
    })
    .exec((err, result) => {
      if (err) {
        log.fatal({ err }, 'failed to fetch report');
        return res.status(500).send(errors.ERR_SRV);
      }

      return res.status(200).send(result);
    });
};
