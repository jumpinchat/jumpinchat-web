/**
 * Created by vivaldi on 08/11/2014.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const banTypes = require('../../config/constants/banTypes');

const RoomSchema = new Schema({
  name: { type: String, index: true },
  attrs: {
    janus_id: String,
    janusServerId: String,
    owner: { type: Schema.Types.ObjectId, default: null },
    created: { type: Date, default: Date.now },
    last_accessed: { type: Date, default: Date.now },
    creation_ip: String,
    time_since_last_disconnect: Date,
    fresh: { type: Boolean, default: true },
    ageRestricted: { type: Boolean, default: false },
  },
  users: [
    {
      createdAt: { type: Date, default: Date.now },
      user_id: { type: Schema.Types.ObjectId, default: null },
      handle: String,
      ip: String,
      signature: { type: String, default: null },
      session_id: String,
      socket_id: { type: String, default: null },
      color: String,
      operator_id: { type: String, default: null },
      assignedBy: { type: String, default: null },
      username: { type: String, default: null },
      isBroadcasting: { type: Boolean, default: false },
      isAdmin: { type: Boolean, default: false },
      isSiteMod: { type: Boolean, default: false },
      isSupporter: { type: Boolean, default: false },
      joinTime: { type: Date, default: Date.now },
      userIcon: { type: String, default: null },
      roles: [{ type: String }],
    },
  ],
  banlist: [
    {
      handle: String,
      user_id: { type: Schema.Types.ObjectId, default: null, ref: 'User' },
      ip: String,
      signature: String,
      timestamp: { type: Date, default: Date.now },
      sessionId: String,
      type: { type: String, default: banTypes.JOIN },
      banDuration: Number,
    },
  ],
  // room settings
  settings: {
    passhash: { type: String, default: null },
    public: { type: Boolean, default: false },
    modOnlyPlayMedia: { type: Boolean, default: false },
    display: { type: String, default: null },
    description: { type: String, default: null },
    topic: {
      text: { type: String, default: null },
      updatedAt: { type: Date, default: null },
      updatedBy: { type: Schema.Types.ObjectId, default: null, ref: 'User' },
    },
    forcePtt: { type: Boolean, default: false },
    forceUser: { type: Boolean, default: false },
    requireVerifiedEmail: { type: Boolean, default: false },
    minAccountAge: { type: Number, default: null },
    moderators: [{
      user_id: { type: Schema.Types.ObjectId, default: null },
      username: { type: String, default: null },
      session_token: { type: String, default: null },
      timestamp: { type: Date, default: Date.now },
      assignedBy: { type: Schema.Types.ObjectId, default: null },
      permissions: {
        ban: { type: Boolean, default: true },
        close_cam: { type: Boolean, default: true },
        mute_user_audio: { type: Boolean, default: true },
        mute_user_chat: { type: Boolean, default: true },
        mute_room_chat: { type: Boolean, default: false },
        mute_room_audio: { type: Boolean, default: false },
        apply_password: { type: Boolean, default: false },
        assign_operator: { type: Boolean, default: false },
        play_youtube: { type: Boolean, default: true },
      },
    }],
  },
});

module.exports = mongoose.model('Room', RoomSchema);
