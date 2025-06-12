// routes/checkout.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');
const Scene = require('../models/Scene');

// POST /api/checkout
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { sceneIds } = req.body;

    if (!Array.isArray(sceneIds) || sceneIds.length === 0) {
      return res.status(400).json({ message: 'No scenes selected for purchase.' });
    }

    const validScenes = await Scene.find({ _id: { $in: sceneIds } });

    const user = await User.findById(userId);

    const newPurchases = validScenes
      .filter(scene => !user.purchasedScenes.includes(scene._id))
      .map(scene => scene._id);

    if (newPurchases.length > 0) {
      user.purchasedScenes.push(...newPurchases);
      await user.save();
    }

    res.status(200).json({ message: 'Checkout complete.', purchasedScenes: user.purchasedScenes });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Server error during checkout.' });
  }
});

module.exports = router;
