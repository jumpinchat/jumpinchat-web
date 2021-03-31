const express = require('express');
const createPayment = require('./controllers/createPayment.controller');
const getSubscription = require('./controllers/getSubscription.controller');
const deleteSubscription = require('./controllers/deleteSubscription.controller');
const updateSource = require('./controllers/updateSource.controller');
const stripeHook = require('./controllers/stripeHook.controller');
const addMissingSubId = require('./controllers/addMissingSubId.controller');
const createCheckoutSession = require('./controllers/createCheckoutSession.controller');
const { validateAccount, rateLimit } = require('../../utils/utils');

const router = express.Router();

router.post('/create', rateLimit, validateAccount, createPayment);
router.post('/session', rateLimit, validateAccount, createCheckoutSession);
router.get('/subscribed/:userId', validateAccount, getSubscription);
router.delete('/subscription/:userId', validateAccount, deleteSubscription);
router.post('/stripe/event', stripeHook);
router.put('/source/update/:userId', validateAccount, updateSource);
router.post('/migrate/missingsubid', addMissingSubId);


module.exports = router;
