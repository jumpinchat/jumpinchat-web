const mongoose = require('mongoose');
const config = require('../../config/env');

const { Schema } = mongoose;
const MessageReportSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  reason: String,
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
});

module.exports = mongoose.model('MessageReport', MessageReportSchema);
