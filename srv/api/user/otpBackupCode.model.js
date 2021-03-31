const mongoose = require('mongoose');

const { Schema } = mongoose;

const OtpBackupCodeSchema = new Schema({
  code: String,
  createdAt: { type: Date, default: Date.now },
  userId: Schema.Types.ObjectId,
});

module.exports = mongoose.model('OtpBackupCode', OtpBackupCodeSchema);
