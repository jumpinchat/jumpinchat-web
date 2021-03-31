const mongoose = require('mongoose');
const { statuses } = require('./ageVerification.const');

const { Schema } = mongoose;

const AgeVerificationSchema = new Schema({
  user: Schema.Types.ObjectId,
  images: [String],
  status: { type: String, default: statuses.PENDING },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model('AgeVerification', AgeVerificationSchema);
