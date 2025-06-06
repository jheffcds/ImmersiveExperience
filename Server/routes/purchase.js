const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Purchase = require('../models/Purchase');
const Scene = require('../models/Scene');
const User = require('../models/User');

// Buy a scene
router.post('/buy', authenticateToken, async (req, res) => {
  const { sceneId, price } = req.body;
  const userId = req.user.userId;

  try {
    const scene = await Scene.findById(sceneId);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optional: check if already purchased
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

    // Optionally update user's purchasedScenes array
    user.purchasedScenes.push(sceneId);
    await user.save();

    // TODO: sendReceiptEmail(user.email, scene, price); — can be added later

    res.status(201).json({ message: 'Scene purchased successfully', purchase });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ message: 'Purchase failed', error: err.message });
  }
});

module.exports = router;
