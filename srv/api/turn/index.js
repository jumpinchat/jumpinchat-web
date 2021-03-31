/**
 * Created by Zaccary on 14/12/2015.
 */

const express = require('express');
const controller = require('./turn.controller.js');

const router = express.Router();


// TODO require an active session (unless request is from an internal address, e.g. janus)
router.get('/', controller.getTurnCreds);
router.post('/', controller.getTurnCreds);

module.exports = router;
