const mongoose = require('mongoose');

const { Schema } = mongoose;

const PlaylistSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  media: [
    {
      createdAt: { type: Date, default: Date.now },
      mediaType: String,
      startedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      startTime: { type: Date, default: null },
      endTime: { type: Date, default: null },
      duration: Number,
      mediaId: String,
      title: String,
      description: { type: String, default: null },
      channelId: { type: String, default: null },
      pausedAt: { type: Date, default: null },
      link: String,
      thumb: String,
    },
  ],
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
