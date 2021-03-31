const express = require('express');
const utils = require('../../utils/utils');

const createRole = require('./connectors/createRole.connector');
const getRoomRoles = require('./connectors/getRoomRoles.connector');
const getRoomRole = require('./connectors/getRoomRole.connector');
const getUserRoles = require('./connectors/getUserRoles.connector');
const addUserToRole = require('./connectors/addUserToRole.connector');
const updateRoomRole = require('./connectors/updateRoomRole.connector');
const removeRoomRole = require('./connectors/removeRoomRole.connector');
const getRoomUserRoleList = require('./connectors/getRoomUserRoleList.connector');
const removeUserFromRole = require('./connectors/removeUserFromRole.connector');
const getUserHasPermissions = require('./connectors/getUserHasPermissions.connector');

const migrateDefaultRoles = require('../../migrations/roles/defaultRoles');

const router = express.Router();

router.get('/room/:roomName', utils.validateSession, getRoomRole);
router.get('/room/:roomName/all', utils.validateSession, getRoomRoles);
router.put('/room/:roomName', utils.validateAccount, updateRoomRole);
router.get('/id/:roleId', utils.validateSession, getRoomRole);
router.get('/:roleId', utils.validateSession, getRoomRole);
router.get('/room/:roomName/enrollments', utils.validateAccount, getRoomUserRoleList);
router.delete('/room/:roomName/role/:roleId', utils.validateAccount, removeRoomRole);
router.get('/user/:roomName/:userListId', utils.validateSession, getUserRoles);
router.post('/', utils.validateAccount, createRole);
router.post('/enroll', utils.validateAccount, addUserToRole);
router.delete('/room/:roomName/enrollment/:enrollmentId', utils.validateAccount, removeUserFromRole);
router.get('/permission/:userId/room/:roomName', getUserHasPermissions);

router.post('/migrate/defaultRoles', (req, res) => {
  migrateDefaultRoles();
  return res.status(200).send();
});

module.exports = router;
