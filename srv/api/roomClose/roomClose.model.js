const mongoose = require('mongoose');
const config = require('../../config/env');

const { Schema } = mongoose;

const RoomCloseSchema = new Schema({
  name: String,
  reason: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
  users: [
    {
      ip: String,
      sessionId: String,
      userId: { type: Schema.Types.ObjectId },
      handle: String,
    },
  ],
});

module.exports = mongoose.model('RoomClose', RoomCloseSchema);
