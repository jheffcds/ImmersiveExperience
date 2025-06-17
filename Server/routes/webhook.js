const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const Scene = require('../models/Scene');
const User = require('../models/User');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlPdf = require('html-pdf-node'); // Make sure you install this
const fs = require('fs');
const path = require('path');

// Raw body required for Stripe webhooks
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Webhook event received:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const sceneIds = JSON.parse(session.metadata.sceneIds);

      const user = await User.findById(userId);
      if (!user) {
        console.warn(`⚠️ User with ID ${userId} not found`);
        return res.status(404).send("User not found");
      }

      const sceneObjectIds = sceneIds.map(id => new mongoose.Types.ObjectId(String(id)));
      // Add scenes to user's purchasedScenes if not already included
      sceneObjectIds.forEach(sceneId => {
        if (!user.purchasedScenes.some(existingId => existingId.equals(sceneId))) {
          user.purchasedScenes.push(sceneId);
        }
      });
      console.log(`✅ User ${user.email} purchased scenes: ${sceneIds.join(', ')}`);
      // 1. Render email HTML using Pug
      const emailHtml = pug.renderFile(
        path.join(__dirname, '../views/emailTemplate.pug'),
        {
          name: user.name || user.email,
          scenes: purchasedScenes,
          total: purchasedScenes.reduce((sum, s) => sum + (s.price || 0), 0),
        }
      );

      // 2. Generate PDF receipt
      const pdfHtml = pug.renderFile(
        path.join(__dirname, '../views/pdfReceipt.pug'),
        {
          name: user.name || user.email,
          scenes: purchasedScenes,
          total: purchasedScenes.reduce((sum, s) => sum + (s.price || 0), 0),
          date: new Date().toLocaleDateString(),
        }
      );
      const file = { content: pdfHtml };
      const pdfBuffer = await htmlPdf.generatePdf(file, { format: 'A4' });
      // 3. Send email with attachment using Nodemailer
      const transporter = nodemailer.createTransport({
        host: 'smtp.aruba.it',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER, // no-reply@vr-verity.com
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: '"VR Verity" <no-reply@vr-verity.com>',
        to: user.email,
        subject: 'Your VR Verity Purchase Receipt',
        html: emailHtml,
        attachments: [{
          filename: 'receipt.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });

      console.log(`📧 Email with receipt sent to ${user.email}`);
    } catch (err) {
      console.error('❌ Error handling checkout completion:', err);
    }
  }

  res.status(200).send('Event received');
});

module.exports = router;
