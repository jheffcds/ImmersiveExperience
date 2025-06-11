// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'uploads/profile/default.png' },  // 👈 new field
  address: { type: String, default: '' }, 
  role: { type: String, default: 'user' },
  favourites: { type: [mongoose.Schema.Types.ObjectId], ref: 'Scene', default: [] },
  purchasedScenes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scene', default: [] }]
}
, { timestamps: true }); // timestamps for createdAt and updatedAt

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
