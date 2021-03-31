/**
 * Created by Zaccary on 14/12/2015.
 */

const express = require('express');
const controller = require('./janus.controller.js');
const utils = require('../../utils/utils');
const handleJanusEvents = require('./controllers/handleJanusEvents.controller');
const getJanusToken = require('./controllers/getJanusToken.controller');

const router = express.Router();

router.get('/endpoints', utils.validateSession, controller.getJanusEndpoints);
router.get('/token', utils.validateSession, getJanusToken);
router.post('/events', handleJanusEvents);

module.exports = router;
