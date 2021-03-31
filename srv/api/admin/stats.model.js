const mongoose = require('mongoose');

const { Schema } = mongoose;

const StatsSchema = new Schema({
  createdAt: { type: Date, index: true },
  rooms: [{
    name: String,
    users: Number,
    broadcasters: Number,
  }],
});

module.exports = mongoose.model('Stats', StatsSchema);
