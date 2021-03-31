/**
 * Created by vivaldi on 08/11/2014.
 */

const mongoose = require('mongoose');
const videoQuality = require('../../config/constants/videoQuality');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: String,
  attrs: {
    join_date: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    last_active: { type: Date, default: Date.now },
    join_ip: String,
    last_login_ip: String,
    userLevel: { type: Number, default: 0 },
    ageVerified: { type: Boolean, default: false },
    isSupporter: { type: Boolean, default: false },
    isGold: { type: Boolean, default: false },
    supportExpires: { type: Date, default: null },
    meta: { type: Boolean, default: false },
  },
  settings: {
    playYtVideos: { type: Boolean, default: true },
    allowPrivateMessages: { type: Boolean, default: true },
    pushNotificationsEnabled: { type: Boolean, default: true },
    receiveUpdates: { type: Boolean, default: false },
    receiveMessageNotifications: { type: Boolean, default: true },
    darkTheme: { type: Boolean, default: false },
    videoQuality: { type: String, default: videoQuality.VIDEO_240.id },
    wideLayout: { type: Boolean, default: false },
    ignoreList: [
      {
        id: String,
        handle: String,
        timestamp: Date,
        expiresAt: { type: Date, default: null },
        userListId: { type: Schema.Types.ObjectId, default: null },
        userId: { type: Schema.Types.ObjectId, default: null },
        sessionId: { type: String, default: null },
      },
    ],
    userIcon: { type: String, default: null },
  },
  auth: {
    email: String,
    email_is_verified: { type: Boolean, default: false },
    passhash: String,
    joinFingerprint: { type: String, default: null },
    latestFingerprint: { type: String, default: null },
    totpSecret: { type: String, default: null },
  },

  profile: {
    bio: { type: String, default: null },
    dob: {
      month: { type: Number, default: null },
      day: { type: Number, default: null },
    },
    location: { type: String, default: null },
    pic: { type: String, default: 'user-avatar/avatar-blank.png' },
  },
  trophies: [
    {
      trophyId: { type: Schema.Types.ObjectId, ref: 'Trophy' },
      awarded: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);
