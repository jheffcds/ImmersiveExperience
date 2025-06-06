const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Set up dynamic multer storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userFolder = path.join(__dirname, '..', 'public', 'uploads', 'profile', req.user.userId);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `profile${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Update profile route
router.put('/update', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  const { name, email, address } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (address) updates.address = address;

  if (req.file) {
    updates.profilePicture = `/uploads/profile/${req.user.userId}/${req.file.filename}`;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, select: 'name email address profilePicture', runValidators: true }
    );
    res.json(updatedUser);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// Change password route
router.put('/change-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Password change failed.', error: err.message });
  }
});

module.exports = router;
