const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');
const Scene = require('../models/Scene');
const mongoose = require('mongoose');
// POST /api/checkout
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('➡️ Checkout route hit');
    const userId = req.user.userId;
    const sceneIds = req.body.sceneIds;
    console.log('🔑 User ID:', userId);
    console.log('🎬 Scene IDs:', sceneIds);

    if (!Array.isArray(sceneIds) || sceneIds.length === 0) {
      console.warn('⚠️ No scene IDs provided.');
      return res.status(400).json({ message: 'No scene IDs provided.' });
    }

    const user = await User.findById(mongoose.Types.ObjectId(userId));
    if (!user) {
      console.warn('❌ User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('🧑 User:', user);
    console.log('🛒 User purchasedScenes:', user.purchasedScenes);

    const scenes = await Scene.find({ _id: { $in: sceneIds } });
    console.log('🎥 Scenes fetched:', scenes);

    const newScenes = scenes.filter(scene => {
      return !(user.purchasedScenes || []).includes(scene._id);
    });

    console.log('🆕 New scenes (not yet purchased):', newScenes);

    if (newScenes.length === 0) {
      console.warn('⛔ All scenes already purchased.');
      return res.status(400).json({ message: 'All scenes already purchased.' });
    }

    const lineItems = newScenes.map(scene => ({
      price_data: {
        currency: 'usd',
        product_data: { name: scene.title },
        unit_amount: Math.round(scene.price * 100),
      },
      quantity: 1,
    }));

    console.log('💰 Line items for Stripe:', lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cart.html`,
      metadata: {
        sceneIds: JSON.stringify(newScenes.map(s => s._id.toString())),
        userId: userId.toString(),
      },
    });

    console.log('✅ Stripe session created:', session.id);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Checkout error:', err.stack || err);
    res.status(500).json({ message: 'Server error during checkout.' });
  }
});

module.exports = router;
