const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profileImage: String,
  role: { type: String, default: 'user' },
  preferredScenes: [{ type: Schema.Types.ObjectId, ref: 'Scene' }],
  boughtScenes: [{ type: Schema.Types.ObjectId, ref: 'Scene' }]
});

module.exports = mongoose.model('User', userSchema);
