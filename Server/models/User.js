const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profileImage: String,
  preferredScenes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scene' }],
  boughtScenes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scene' }],
});

module.exports = mongoose.model('User', userSchema);
