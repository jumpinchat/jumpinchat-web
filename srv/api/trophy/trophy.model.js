const mongoose = require('mongoose');

const { Schema } = mongoose;

const TrophySchema = new Schema({
  name: String,
  image: {
    type: String,
    default: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-placeholder.png',
  },
  title: String,
  description: { type: String, default: null },
  type: String,
  conditions: {
    date: {
      day: Number,
      month: Number,
      year: Number,
    },
    duration: {
      years: Number,
    },
  },
});

module.exports = mongoose.model('Trophy', TrophySchema);
