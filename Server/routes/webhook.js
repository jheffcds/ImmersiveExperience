// routes/webhook.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Scene = require('../models/Scene');
const bodyParser = require('body-parser');

router.post(
  '/checkout/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const customerEmail = session.customer_email;
      const metadata = session.metadata; // You should pass sceneIds here during checkout session creation

      const user = await User.findOne({ email: customerEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const sceneIds = JSON.parse(metadata.sceneIds);
      const validScenes = await Scene.find({ _id: { $in: sceneIds } });

      const newPurchases = validScenes
        .filter(scene => !user.purchasedScenes.includes(scene._id))
        .map(scene => scene._id);

      if (newPurchases.length > 0) {
        user.purchasedScenes.push(...newPurchases);
        await user.save();

        await sendEmail({
  to: user.email,
  subject: '🎉 Thank You for Your VR Scene Purchase!',
  text: `Thanks for your purchase!\n\nScenes:\n${validScenes.map(s => s.title).join('\n')}`,
  html: `
    <h2>Thank you for your purchase, ${user.name || 'VR Explorer'}!</h2>
    <p>Here are the scenes you just bought:</p>
    <ul>
      ${validScenes.map(scene => `<li><strong>${scene.title}</strong></li>`).join('')}
    </ul>
    <p>You can now view them in your <a href="${process.env.CLIENT_URL}/dashboard.html">dashboard</a>.</p>
    <br/>
    <p>🎨 Happy Exploring!<br/>The Step Into Art Team</p>
  `
});

      }

      console.log(`✅ Updated purchasedScenes for ${user.email}`);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
