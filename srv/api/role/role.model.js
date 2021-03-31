const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoleSchema = new Schema({
  name: { type: String, index: true, required: true },
  tag: { type: String, index: true, required: true }, // e.g. @role_name
  roomId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
  permanent: { type: Boolean, default: false }, // Permanent roles can not be removed by users
  isDefault: { type: Boolean, default: false }, // role should be assigned to everybody
  order: Number,
  icon: {
    name: String,
    color: String,
    url: { type: String, default: null },
  },
  permissions: {
    ban: { type: Boolean, default: false },
    kick: { type: Boolean, default: false },
    closeCam: { type: Boolean, default: false },
    muteUserAudio: { type: Boolean, default: false },
    muteUserChat: { type: Boolean, default: false },
    muteRoomChat: { type: Boolean, default: false },
    muteRoomAudio: { type: Boolean, default: false },
    applyPassword: { type: Boolean, default: false },
    assignRoles: { type: Boolean, default: false },
    manageRoles: { type: Boolean, default: false },
    playMedia: { type: Boolean, default: true },
    controlMedia: { type: Boolean, default: false },
    playYoutube: { type: Boolean, default: true },
    uploadEmoji: { type: Boolean, default: false },
    roomDetails: { type: Boolean, default: false },
    broadcast: { type: Boolean, default: true },
    bypassPassword: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('Role', RoleSchema);
