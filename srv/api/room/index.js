/**
 * Created by vivaldi on 08/11/2014.
 */


const express = require('express');
const config = require('../../config/env');
const controller = require('./room.controller.js');
const utils = require('../../utils/utils');
const uploadDisplayPic = require('./controllers/room.uploadDisplayPic');
const registerPush = require('./controllers/room.registerPush');
const infoRead = require('./controllers/room.infoRead');
const submitRoomPassword = require('./controllers/room.submitRoomPassword');
const setAgeRestricted = require('./controllers/room.setAgeRestricted');
const uploadEmoji = require('./controllers/room.uploadEmoji');
const getEmoji = require('./controllers/room.getEmoji');
const removeEmoji = require('./controllers/room.removeEmoji');
const getRoomList = require('./controllers/room.getRoomList');
const roomSanitize = require('./connectors/room.sanitize.connector');

const migrateMissingRooms = require('../../migrations/rooms/missingRooms');

const router = express.Router();


router.get('/public', utils.verifyInternalSecret, getRoomList);
router.post('/:room/password', utils.validateSession, submitRoomPassword);
router.get('/:roomName/emoji', getEmoji);
router.get('/:room', utils.validateSession, controller.getRoom);
router.put('/:room/uploadImage', utils.validateAccount, uploadDisplayPic);
router.post('/push/:socketId/register', utils.validateSession, registerPush);
router.get('/push/publickey', utils.validateSession, (req, res) => {
  res.status(200).send({ key: config.push.publicKey });
});
router.put('/:roomName/sanitize', utils.verifyInternalSecret, roomSanitize);
router.put('/:room/inforead', utils.validateAccount, infoRead);
router.put('/:roomName/setAgeRestricted', utils.validateAccount, setAgeRestricted);
router.post('/:roomName/uploadEmoji', utils.validateAccount, uploadEmoji);
router.delete('/emoji/:emojiId', utils.validateAccount, removeEmoji);
router.post('/migrate/missingRooms', (req, res) => {
  migrateMissingRooms();
  return res.status(200).send();
});
router.post('/confirmAge', utils.validateSession, (req, res) => {
  req.session.ageConfirmed = true;
  return res.status(200).send();
});

module.exports = router;
