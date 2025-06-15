// routes/webhook.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const Scene = require('../models/Scene');
const User = require('../models/User');

// Stripe requires raw body for webhooks
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Set this in Stripe Dashboard
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Get metadata
      const userId = session.metadata.userId;
      const sceneIds = JSON.parse(session.metadata.sceneIds); // We’ll add these in step 2

      // Add purchased scenes to user
      await User.findByIdAndUpdate(userId, {
        $addToSet: { purchasedScenes: { $each: sceneIds } }
      });

      console.log(`User ${userId} purchased scenes: ${sceneIds.join(', ')}`);
    } catch (err) {
      console.error('Error saving purchased scenes:', err);
    }
  }

  res.status(200).send('Event received');
});

module.exports = router;
