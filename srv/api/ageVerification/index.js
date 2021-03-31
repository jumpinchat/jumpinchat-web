const express = require('express');
const { verifyAdmin } = require('../../utils/utils');

const router = express.Router();

const getVerificationRequests = require('./controllers/getVerificationRequests');
const getVerificationRequest = require('./controllers/getVerificationRequest');
const updateRequest = require('./controllers/updateRequest');

router.get('/', verifyAdmin, getVerificationRequests);
router.get('/:id', verifyAdmin, getVerificationRequest);
router.put('/:id', verifyAdmin, updateRequest);

module.exports = router;
