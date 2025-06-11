const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');

// Add or remove sceneId from user's favourites
router.post('/', authenticateToken, async (req, res) => {
  const { sceneId } = req.body;

  if (!sceneId) {
    return res.status(400).json({ error: 'sceneId is required' });
  }

  const userId = req.user.userId; // ✅ Extracted from token

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const index = user.favourites.indexOf(sceneId);

    if (index === -1) {
      user.favourites.push(sceneId);
    } else {
      user.favourites.splice(index, 1); // Toggle off
    }

    await user.save();

    res.status(200).json({
      message: 'Favourite list updated',
      favourites: user.favourites,
    });
  } catch (err) {
    console.error('Error adding to favourites:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
