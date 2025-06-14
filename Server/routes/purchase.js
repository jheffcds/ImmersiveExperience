// routes/purchase.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Purchase = require('../models/Purchase');
const Scene = require('../models/Scene');
const User = require('../models/User');

router.post('/buy', authenticateToken, async (req, res) => {
  const { sceneId, price } = req.body;
  const userId = req.user.userId;
  try {
    const scene = await Scene.findById(sceneId);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyPurchased = await Purchase.findOne({ user: userId, scene: sceneId });
    if (alreadyPurchased) {
      return res.status(400).json({ message: 'Scene already purchased.' });
    }
    const purchase = new Purchase({
      user: userId,
      scene: sceneId,
      price,
      receiptEmail: user.email
    });
    await purchase.save();
    if (!user.purchasedScenes.includes(sceneId)) {
      user.purchasedScenes.push(sceneId);
      await user.save();
    }
    res.status(201).json({ message: 'Scene purchased successfully', purchase });
  } catch (err) {
    console.error('❌ Purchase error:', err);
    res.status(500).json({ message: 'Purchase failed', error: err.message });
  }
});
module.exports = router;
