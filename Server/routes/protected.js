const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to your dashboard',
    user: req.user,
  });
});

module.exports = router;
