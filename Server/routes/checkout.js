// routes/checkout.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Replace with real secret key
const Scene = require('../models/Scene');
const User = require('../models/User');
const authMiddleware = require('../middleware/authenticateToken'); // Protect route if needed

router.post('/checkout', authMiddleware, async (req, res) => {
  console.log('Checkout request received:', req.body);
  const { sceneIds } = req.body;
  if (!sceneIds || !Array.isArray(sceneIds) || sceneIds.length === 0) {
    return res.status(400).json({ error: 'No scenes to checkout' });
  }
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  try {
    const scenes = await Scene.find({ _id: { $in: sceneIds } });
    console.log(`Found ${scenes.length} scenes for checkout:`, scenes.map(s => s.title).join(', '));
    const lineItems = scenes.map(scene => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: scene.title,
          description: scene.description,
        },
        unit_amount: Math.round((scene.price || 0) * 100), // in cents
      },
      quantity: 1,
    }));
    console.log('Line items for Stripe:', lineItems);
    console.log('User ID for checkout:', req.user.userId);
    console.log('Scene IDs for checkout:', sceneIds);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://www.vr-verity.com/success.html',
      cancel_url: 'https://www.vr-verity.com/cart.html?fromCheckout=true',
      metadata: {
        userId: req.user.userId, // req.user is available from auth middleware
        sceneIds: JSON.stringify(sceneIds), // Pass purchased scenes
      },
    });
    console.log('Stripe session created:', session.id);
    console.log('Stripe session URL:', session.url);
    console.log('Stripe session metadata:', session.metadata);
    console.log('Stripe session line items:', session.line_items);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Stripe checkout failed' });
  }
});

module.exports = router;
