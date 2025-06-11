const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Scene = require('../models/Scene');
const authenticateToken = require('../middleware/auth');

// ================= GET all favourite scenes for the logged-in user =================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favouriteScenes');
    res.json(user.favouriteScenes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get favourites', error: err.message });
  }
});

// ================= POST: Add a scene to favourites =================
router.post('/:sceneId', authenticateToken, async (req, res) => {
  try {
    const { sceneId } = req.params;
    const user = await User.findById(req.user.userId);

    if (user.favouriteScenes.includes(sceneId)) {
      return res.status(400).json({ message: 'Scene already in favourites' });
    }

    user.favouriteScenes.push(sceneId);
    await user.save();
    res.status(200).json({ message: 'Scene added to favourites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to favourites', error: err.message });
  }
});

// ================= DELETE: Remove a scene from favourites =================
router.delete('/:sceneId', authenticateToken, async (req, res) => {
  try {
    const { sceneId } = req.params;
    const user = await User.findById(req.user.userId);

    const index = user.favouriteScenes.indexOf(sceneId);
    if (index === -1) {
      return res.status(404).json({ message: 'Scene not in favourites' });
    }

    user.favouriteScenes.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Scene removed from favourites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove from favourites', error: err.message });
  }
});

module.exports = router;
