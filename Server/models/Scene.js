const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  sceneId: { type: String, required: true, unique: true }, // ✅ Add this line
  title: { type: String, required: true },
  description: String,
  story: String,
  price: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  images: [String],
  link: String,
  featured: { type: Boolean, default: false }
});

module.exports = mongoose.model('Scene', sceneSchema);
