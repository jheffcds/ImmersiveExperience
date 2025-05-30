const express = require('express');
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Scene = require('../models/Scene');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const authenticate = require('../middleware/authenticateToken'); // make sure it's required
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Account created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//populate the user's scenes
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('preferredScenes')
      .populate('boughtScenes')
      .select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error in /me:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        profileImage: picture,
        password: '', // Not needed for Google users
      });
      await user.save();
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;
