/**
 * Created by vivaldi on 08/11/2014.
 */

const express = require('express');
const settings = require('./controllers/user.settings');
const utils = require('../../utils/utils');

const router = express.Router();

const controller = require('./user.controller');
const uploadDisplayImage = require('./controllers/user.uploadDisplayImage');
const verifyEmail = require('./controllers/user.verifyEmail');
const requestVerifyEmail = require('./controllers/user.requestVerifyEmail');
const resetPasswordRequest = require('./controllers/user.resetPasswordRequest');
const resetPasswordVerify = require('./controllers/user.resetPasswordVerify');
const resetPassword = require('./controllers/user.resetPassword');
const contactForm = require('./controllers/user.contact');
const setNotificationsEnabled = require('./controllers/user.setNotificationsEnabled');
const changeEmail = require('./controllers/user.changeEmail');
const removeUser = require('./controllers/user.remove');
const unsubscribe = require('./controllers/user.unsubscribe');
const checkBroadcastRestrictions = require('./controllers/user.checkBroadcastRestrictions');
const setLayout = require('./controllers/user.setLayout');
const setTheme = require('./controllers/user.setTheme');
const getProfile = require('./controllers/user.getProfile');
const uploadVerification = require('./controllers/user.uploadVerification');
const uploadUserIcon = require('./controllers/user.uploadUserIcon');
const setBroadcastQuality = require('./controllers/user.setBroadcastQuality');
const getUserByName = require('./connectors/getUserByName.connector');
const mfaRequestEnroll = require('./connectors/mfaRequestEnroll.connector');
const mfaConfirmEnroll = require('./connectors/mfaConfirmEnroll.connector');
const mfaValidate = require('./connectors/mfaValidate.connector');
const mfaGenBackupCodes = require('./connectors/mfaGenBackupCodes.connector');
const mfaDisable = require('./connectors/mfaDisable.connector');

router.post('/session', controller.createSession);
router.post('/:id/settings', utils.validateAccount, settings);
router.post('/register', utils.rateLimit, controller.createUser);
router.post('/login', utils.rateLimit, controller.login);
router.post('/logout', controller.logout);
router.get('/checkCanBroadcast/:roomName?', checkBroadcastRestrictions);
router.put('/:userId/uploadImage', utils.validateAccount, uploadDisplayImage);
router.put('/:userId/uploadUserIcon', utils.validateAccount, uploadUserIcon);
router.put('/:userId/setnotifications', utils.validateAccount, setNotificationsEnabled);
router.put('/:userId/changeEmail', utils.validateAccount, changeEmail);
router.get('/:userId/profile', utils.validateSession, getProfile);
router.delete('/:userId/remove', utils.validateAccount, removeUser);
router.get('/unsubscribe/:token', unsubscribe);
router.put('/:userId/theme', utils.validateAccount, setTheme);
router.post('/:userId/age-verify/upload', utils.validateAccount, uploadVerification);
router.put('/setBroadcastQuality', utils.validateAccount, setBroadcastQuality);
router.put('/setLayout', utils.validateAccount, setLayout);

router.get('/:username', utils.validateAccount, utils.rateLimit, getUserByName);

router.post('/verify/email', utils.rateLimit, requestVerifyEmail);
router.get('/verify/email/:token', verifyEmail);

router.post('/password/request', resetPasswordRequest);
router.get('/password/reset/:token', resetPasswordVerify);
router.post('/password/reset', resetPassword);

router.get('/mfa/request', utils.validateAccount, mfaRequestEnroll);
router.post('/mfa/confirm', utils.validateAccount, mfaConfirmEnroll);
router.post('/mfa/verify', utils.validateAccount, mfaValidate);
router.get('/mfa/backup', utils.validateAccount, mfaGenBackupCodes);
router.put('/mfa/disable', utils.validateAccount, mfaDisable);

router.get('/checkusername/:username', controller.checkUsername);
router.put('/socket/old/:oldId/new/:newId', controller.updateSession);
router.post('/hasremindedverify', utils.validateAccount, (req, res) => {
  const verifyReminderCookieName = 'jic.verifyReminder';
  if (!req.cookies[verifyReminderCookieName]) {
    res.cookie(verifyReminderCookieName, Date.now(), {
      maxAge: 1000 * 60 * 60 * 24,
    });
  }

  res.status(204).send();
});

router.post('/contact', contactForm);

module.exports = router;
