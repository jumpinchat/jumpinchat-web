const express = require('express');
const {
  validateSession,
  validateAccount,
  verifyAdmin,
  verifySiteMod,
  rateLimit,
} = require('../../utils/utils');
const addReport = require('./controllers/addReport.controller');
const addMessageReport = require('./controllers/addMessageReport.controller');
const getReports = require('./controllers/getReports.controller');
const getReportById = require('./controllers/getReportById.controller');
const getMessageReports = require('./controllers/getMessageReports.controller');
const getMessageReportById = require('./controllers/getMessageReportById.controller');
const setReportResolved = require('./controllers/setReportResolved.controller');

const router = express.Router();

router.post('/', rateLimit, validateSession, addReport);
router.post('/message', validateAccount, addMessageReport);
router.get('/', verifySiteMod, getReports);
router.get('/message', verifyAdmin, getMessageReports);
router.get('/message/:reportId', verifyAdmin, getMessageReportById);
router.get('/:reportId', verifySiteMod, getReportById);
router.post('/resolve', verifySiteMod, setReportResolved);

module.exports = router;
