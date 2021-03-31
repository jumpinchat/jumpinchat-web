
const mongoose = require('mongoose');
const config = require('../../config/env');

const { Schema } = mongoose;
const ReportSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  reason: String,
  description: { type: String, default: null },
  active: { type: Boolean, default: true },
  resolution: {
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    outcome: String,
  },
  room: {
    name: String,
    roomId: Schema.Types.ObjectId,
  },
  target: {
    ip: String,
    userListId: Schema.Types.ObjectId,
    userId: { type: Schema.Types.ObjectId, default: null },
    sessionId: String,
    handle: String,
    socketId: String,
    fingerprint: String,
  },
  reporter: {
    ip: String,
    userListId: Schema.Types.ObjectId,
    userId: { type: Schema.Types.ObjectId, default: null },
    sessionId: String,
    handle: String,
    socketId: String,
  },
  log: {
    body: {
      chat: [
        {
          timestamp: Date,
          userId: Schema.Types.ObjectId,
          message: String,
          handle: String,
        },
      ],
      privateMessages: [
        {
          timestamp: Date,
          userId: Schema.Types.ObjectId,
          message: String,
          handle: String,
        },
      ],
      screenshot: { type: String, default: null },
    },
  },
});

module.exports = mongoose.model('Report', ReportSchema);
