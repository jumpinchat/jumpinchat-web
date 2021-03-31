const mongoose = require('mongoose');

const { Schema } = mongoose;

const EmailBlacklistSchema = new Schema({
  address: String,
  domain: String,
  type: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
});

module.exports = mongoose.model('EmailBlacklist', EmailBlacklistSchema);
