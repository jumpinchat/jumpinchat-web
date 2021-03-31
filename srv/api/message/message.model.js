const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, index: 1, ref: 'Conversation' },
  attrs: {
    unread: { type: Boolean, default: true },
    archived: {
      recipient: { type: Boolean, default: false },
      sender: { type: Boolean, default: false },
    },
  },
  createdAt: { type: Date, default: Date.now },
  sender: { type: Schema.Types.ObjectId, index: 1, ref: 'User' },
  recipient: { type: Schema.Types.ObjectId, index: 1, ref: 'User' },
  message: String,
});

module.exports = mongoose.model('Message', MessageSchema);
