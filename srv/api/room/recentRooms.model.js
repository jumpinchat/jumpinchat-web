const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecentRoomsSchema = new Schema({
  rooms: [{
    roomId: Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
  }],
  user: Schema.Types.ObjectId,
});

module.exports = mongoose.model('RecentRooms', RecentRoomsSchema);
