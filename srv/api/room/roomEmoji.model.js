const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomEmojiSchema = new Schema({
  image: String,
  createdAt: { type: Date, default: Date.now },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  alias: String,
  room: Schema.Types.ObjectId,
});

module.exports = mongoose.model('RoomEmoji', RoomEmojiSchema);
