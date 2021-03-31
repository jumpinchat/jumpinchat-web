const mongoose = require('mongoose');
const config = require('../../config/env');

const { Schema } = mongoose;

const VerifySchema = new Schema({
  token: String,
  createdAt: { type: Date, expires: config.verification.emailTimeout, default: Date.now },
  expireDate: Date,
  userId: Schema.Types.ObjectId,
  type: String,
});

module.exports = mongoose.model('Verify', VerifySchema);
