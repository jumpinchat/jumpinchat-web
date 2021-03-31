const mongoose = require('mongoose');

const { Schema } = mongoose;

const BanlistSchema = new Schema({
  ip: String,
  userId: Schema.Types.ObjectId,
  username: { type: String, default: null },
  email: { type: String, default: null },
  sessionId: String,
  fingerprint: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  reason: String,
  restrictions: {
    broadcast: { type: Boolean, default: true },
    join: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model('Banlist', BanlistSchema);
