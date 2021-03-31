const express = require('express');
const utils = require('../../utils/utils');
const retrieveConversations = require('./controllers/retrieveConversations.controller');
const singleConversation = require('./controllers/singleConversation.controller');
const addMessage = require('./controllers/addMessage.controller');
const getUnread = require('./controllers/getUnread.controller');
const markRead = require('./controllers/markRead.controller');
const markAllRead = require('./controllers/markAllRead.controller');
const adminMessageAll = require('./controllers/adminMessageAll.controller');
const archiveMessages = require('./controllers/archiveMessages.controller');


const migrateConvoId = require('../../migrations/messages/conversationId');

const router = express.Router();

router.post('/admin/send', utils.verifyAdmin, adminMessageAll);
router.get('/:userId', utils.validateAccount, retrieveConversations);
router.get('/:userId/unread', utils.validateAccount, getUnread);
router.get('/:userId/:participantId', utils.validateAccount, singleConversation);
router.put('/read', utils.validateAccount, markAllRead);
router.put('/read/:userId/:participantId', utils.validateAccount, markRead);
router.put('/archive/:userId/:participantId', utils.validateAccount, archiveMessages);

router.post('/:recipient', utils.validateAccount, addMessage);

router.post('/migrate/conversationId', (req, res) => {
  migrateConvoId();
  return res.status(200).send();
});

module.exports = router;
