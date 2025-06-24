const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');
// ✅ GET route to fetch user's favourites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('favourites');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ favourites: user.favourites });
  } catch (err) {
    console.error('Error fetching favourites:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ POST route to toggle favourite
router.post('/', authenticateToken, async (req, res) => {
  const { sceneId } = req.body;
 
  if (!sceneId) {
    return res.status(400).json({ error: 'sceneId is required' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const index = user.favourites.findIndex(id => id.toString() === sceneId);

    if (index === -1) {
      user.favourites.push(sceneId);
    } else {
      user.favourites.splice(index, 1);
    }

    await user.save();

    res.status(200).json({
      message: 'Favourite list updated',
      favourites: user.favourites,
    });
  } catch (err) {
    console.error('Error toggling favourite:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;