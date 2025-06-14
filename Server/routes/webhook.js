const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Scene = require('../models/Scene');
const Purchase = require('../models/Purchase'); // ✅ Add this if you're tracking purchases
const bodyParser = require('body-parser');
const sendEmail = require('../utils/sendEmail');

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
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_email;
      const metadata = session.metadata;

      try {
        const user = await User.findOne({ email: customerEmail });
        if (!user) {
          console.warn(`⚠️ User not found for email: ${customerEmail}`);
          return res.status(404).json({ message: 'User not found' });
        }

        const sceneIds = JSON.parse(metadata.sceneIds || '[]');
        if (!Array.isArray(sceneIds) || sceneIds.length === 0) {
          return res.status(400).send('Invalid or missing sceneIds in metadata.');
        }

        const scenes = await Scene.find({ _id: { $in: sceneIds } });
        const newScenes = scenes.filter(scene => !user.purchasedScenes.includes(scene._id));

        for (const scene of newScenes) {
          await new Purchase({
            user: user._id,
            scene: scene._id,
            price: scene.price,
            receiptEmail: user.email
          }).save();
        }

        if (newScenes.length > 0) {
          user.purchasedScenes.push(...newScenes.map(s => s._id));
          await user.save();

          await sendEmail({
            to: user.email,
            subject: '🎉 Thank You for Your VR Scene Purchase!',
            text: `Thanks for your purchase!\n\nScenes:\n${newScenes.map(s => s.title).join('\n')}`,
            html: 
            `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                  <table width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <thead style="background-color: #111827;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <img src="https://vr-verity.com/assets/images/logo.png" alt="VR VERITY Logo" style="max-height: 60px; margin-bottom: 10px;" />
                          <h1 style="color: #ffffff; margin: 0;">VR VERITY</h1>
                          <p style="color: #d1d5db; margin: 0;">Step Into Art</p>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding: 30px;">
                          <h2 style="margin-top: 0;">Thank you for your purchase, ${user.name || 'VR Explorer'}! 🎉</h2>
                          <p>We're excited to let you know that your VR scene purchase was successful. Here's what you bought:</p>
                          <ul style="padding-left: 20px; line-height: 1.6;">
                            ${validScenes.map(scene => `<li><strong>${scene.title}</strong></li>`).join('')}
                          </ul>
                          <p>You can now access your scenes directly from your dashboard.</p>

                          <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}/dashboard.html" style="background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
                          </div>

                          <p style="color: #6b7280;">If you have any issues or questions, feel free to contact us at <a href="mailto:info@vr-verity.com">info@vr-verity.com</a>.</p>
                          <p style="margin-top: 40px;">Stay creative,<br/>– The VR VERITY Team</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <footer style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} VR VERITY – All rights reserved.
                  </footer>
                </div>
              `
          });

          console.log(`✅ ${newScenes.length} new scene(s) added to ${user.email}`);
        }
      } catch (err) {
        console.error('❌ Error handling Stripe session:', err);
        return res.status(500).send('Webhook processing error');
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
