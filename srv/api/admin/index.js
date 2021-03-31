/**
 * Created by Zaccary on 14/12/2015.
 */

const express = require('express');
const log = require('../../utils/logger.util')({ name: 'admin.api' });
const { verifyAdmin, verifySiteMod } = require('../../utils/utils');
const controller = require('./admin.controller.js');
const sendBulkEmails = require('./controllers/sendBulkEmails.controller');
const bounceNotification = require('./controllers/bounceNotification.controller');
const openNotification = require('./controllers/openNotification.controller');
const removeUser = require('./controllers/removeUser.controller');
const siteBan = require('./controllers/siteBan.controller');
const getBanItem = require('./controllers/getBanItem.controller');
const closeRoom = require('./controllers/closeRoom.controller');
const getStats = require('./controllers/stats.controller');
const addSiteMod = require('./controllers/addSiteMod.controller');
const removeSiteMod = require('./controllers/removeSiteMod.controller');
const getSiteMods = require('./controllers/getSiteMods.controller');
const getModActivity = require('./controllers/getModActivity.controller');

const router = express.Router();

router.post('/notify/restart/:seconds', controller.notifyServerRestart);
router.post('/notify', controller.notify);
router.get('/rooms', verifyAdmin, controller.getActiveRooms);
router.get('/rooms/:roomId', verifyAdmin, controller.getRoomById);
router.get('/users', verifyAdmin, controller.getUserList);
router.delete('/users/remove/:userId', verifyAdmin, removeUser);
router.post('/email/send', verifyAdmin, sendBulkEmails);
router.post('/email/bounce', bounceNotification);
router.post('/email/open', openNotification);
router.post('/siteban', verifySiteMod, siteBan);
router.get('/siteban/:banId', verifySiteMod, getBanItem);
router.post('/rooms/:roomName/close', verifyAdmin, closeRoom);
router.get('/stats', verifyAdmin, getStats);
router.post('/sitemod', verifyAdmin, addSiteMod);
router.delete('/sitemod/:modId', verifyAdmin, removeSiteMod);
router.get('/sitemods', verifyAdmin, getSiteMods);
router.get('/modactivity', verifyAdmin, getModActivity);

module.exports = router;
