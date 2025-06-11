const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const User = require('../models/User');

// Add or remove sceneId from user's favourites
router.post('/', authenticate, async (req, res) => {
  try {
    const { sceneId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.favourites.indexOf(sceneId);

    if (index === -1) {
      // Add to favourites
      user.favourites.push(sceneId);
    } else {
      // Remove from favourites
      user.favourites.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ favourites: user.favourites });

  } catch (err) {
    console.error('Favourite toggle failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
