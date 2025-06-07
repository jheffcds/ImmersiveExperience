const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  images: [String],
  link: String,
  featured: { type: Boolean, default: false }
});

module.exports = mongoose.model('Scene', sceneSchema);
