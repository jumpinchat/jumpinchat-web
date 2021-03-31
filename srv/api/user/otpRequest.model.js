const mongoose = require('mongoose');
const config = require('../../config/env');

const { Schema } = mongoose;

const OtpRequestSchema = new Schema({
  secret: String,
  createdAt: { type: Date, expires: config.verification.emailTimeout, default: Date.now },
  userId: Schema.Types.ObjectId,
});

module.exports = mongoose.model('OtpRequest', OtpRequestSchema);
