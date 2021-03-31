const mongoose = require('mongoose');

const { Schema } = mongoose;

const EnrolledSchema = new Schema({
  role: { type: Schema.Types.ObjectId, required: true, ref: 'Role' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  createdAt: { type: Date, default: Date.now },
  enrolledBy: { type: Schema.Types.ObjectId },
  ident: {
    ip: { type: String, default: null },
    sessionId: { type: String, default: null },
  },
});

module.exports = mongoose.model('Enrolled', EnrolledSchema);
