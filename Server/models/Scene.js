const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  link: {
    type: String,
    required: true,
  }
}, { timestamps: true }); // optional, to track createdAt and updatedAt

module.exports = mongoose.model('Scene', sceneSchema);
