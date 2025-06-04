// backend/routes/config.js or directly in your main server file
const express = require('express');
const router = express.Router();

router.get('/google', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

module.exports = router;
