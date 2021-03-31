const log = require('../../../utils/logger.util')({ name: 'getReports' });
const config = require('../../../config/env');
const reportModel = require('../report.model');
const errors = require('../../../config/constants/errors');

module.exports = async function getReports(req, res) {
  const { page } = req.query;
  const countPerPage = config.admin.userList.itemsPerPage;
  const start = ((page - 1) * countPerPage);

  const reportCount = await reportModel.countDocuments({ active: true }).exec();
  return reportModel.find()
    .where('active').equals(true)
    .sort('-createdAt')
    .skip(start)
    .limit(countPerPage)
    .exec((err, result) => {
      if (err) {
        log.fatal({ err }, 'failed to fetch reports');
        return res.status(500).send(errors.ERR_SRV);
      }

      return res.status(200).send({
        reports: result,
        count: reportCount,
      });
    });
};
