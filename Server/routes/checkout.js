// routes/checkout.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Scene = require('../models/Scene');
const authenticateToken = require('../middleware/authenticateToken');
const sendEmail = require('../utils/sendEmail'); // Utility you'll create
// ✅ Create Stripe Checkout Session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { sceneIds } = req.body;

    if (!Array.isArray(sceneIds) || sceneIds.length === 0) {
      return res.status(400).json({ message: 'No scenes selected for purchase.' });
    }
    const scenes = await Scene.find({ _id: { $in: sceneIds } });
    const line_items = scenes.map(scene => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: scene.title,
        },
        unit_amount: Math.round(scene.price * 100),
      },
      quantity: 1,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cart.html`,
      metadata: {
        userId: userId.toString(),
        sceneIds: JSON.stringify(sceneIds)
      }
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session creation failed:', err);
    res.status(500).json({ message: 'Checkout session creation failed' });
  }
});
module.exports = router;
