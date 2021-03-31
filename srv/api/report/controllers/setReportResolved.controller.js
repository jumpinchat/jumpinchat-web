const log = require('../../../utils/logger.util')({ name: 'setReportResolved' });
const errors = require('../../../config/constants/errors');
const reportUtils = require('../report.utils');
const { resolutionOutcomes } = require('../report.constants');

module.exports = async function setReportResolved(req, res) {
  const {
    reportId,
  } = req.body;

  try {
    await reportUtils.resolveReport(reportId, req.user._id, resolutionOutcomes.RESOLUTION_NONE);
    log.info({ reportId }, 'report resolved');
    return res.status(200).send();
  } catch (err) {
    log.fatal({ err }, 'failed to resolve report');
    if (err.name === 'MissingValueError') {
      return res.status(404).send(err);
    }

    return res.status(500).send(errors.ERR_SRV);
  }
};
