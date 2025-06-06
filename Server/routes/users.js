const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');

// Update profile route
router.put('/update', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  const { name, email, address } = req.body;
  const profilePicture = req.file ? `/uploads/profile/${req.file.filename}` : undefined;

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (address) updates.address = address;
  if (profilePicture) updates.profilePicture = profilePicture;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, select: 'name email address profilePicture' }
    );
    res.json(updatedUser);
  } catch (err) {
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
