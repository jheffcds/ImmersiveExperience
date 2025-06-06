const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

// Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create user first to get ID
    const user = new User({ name, email, password });
    await user.save();

    // Create user-specific folder
    const userFolder = path.join(__dirname, '..', 'public', 'uploads', 'profile', user._id.toString());
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    // Copy default image
    const defaultImagePath = path.join(__dirname, '..', 'public', 'uploads', 'profile', 'default.png');
    const userImagePath = path.join(userFolder, 'default.png');

    try {
      fs.copyFileSync(defaultImagePath, userImagePath);
    } catch (fileErr) {
      console.error('Error copying default image:', fileErr);
      return res.status(500).json({ message: 'Failed to set up profile image.' });
    }

    // Update profilePicture path in DB
    await User.findByIdAndUpdate(user._id, {
      profilePicture: `/uploads/profile/${user._id}/default.png`
    });

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



// Login an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, name: user.name, role: user.role, picture: user.profilePicture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    // If not, create new user with random password
    if (!user) {
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // auto-gen password
        profilePicture: payload.picture
      });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, name: user.name, picture: user.profilePicture });
  } catch (err) {
    console.error('Google Sign-In error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});
// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      address: user.address,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
