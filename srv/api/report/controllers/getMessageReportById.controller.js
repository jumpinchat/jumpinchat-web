const log = require('../../../utils/logger.util')({ name: 'getMessageReportById' });
const messageReportModel = require('../messageReport.model');
const errors = require('../../../config/constants/errors');

module.exports = function getMessageReportById(req, res) {
  const { reportId } = req.params;

  return messageReportModel
    .findOne({ _id: reportId })
    .populate({
      path: 'message',
      select: ['recipient', 'sender', '_id', 'message'],
    })
    .exec((err, result) => {
      if (err) {
        log.fatal({ err }, 'failed to fetch reports');
        return res.status(500).send(errors.ERR_SRV);
      }

      return res.status(200).send(result);
    });
};
