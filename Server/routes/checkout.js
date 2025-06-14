const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');
const Scene = require('../models/Scene');

// POST /api/checkout
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { sceneIds } = req.body;

    if (!Array.isArray(sceneIds) || sceneIds.length === 0) {
      return res.status(400).json({ message: 'No scene IDs provided.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`❌ User not found for ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const scenes = await Scene.find({ _id: { $in: sceneIds } });
    if (scenes.length === 0) {
      return res.status(404).json({ message: 'No scenes found for the provided IDs.' });
    }

    const userPurchased = user.purchasedScenes || [];

    const newScenes = scenes.filter(
      scene => !userPurchased.includes(scene._id)
    );

    if (newScenes.length === 0) {
      return res.status(400).json({ message: 'All scenes already purchased.' });
    }

    const lineItems = newScenes.map(scene => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: scene.title,
        },
        unit_amount: Math.round(scene.price * 100), // price in cents
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cart.html`,
      metadata: {
        sceneIds: JSON.stringify(newScenes.map(s => s._id.toString())),
        userId: userId.toString()
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Checkout error:', err);
    res.status(500).json({ message: 'Server error during checkout.' });
  }
});

module.exports = router;
