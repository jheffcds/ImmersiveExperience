const express = require('express');
const User = require('../models/User');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

router.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

module.exports = router;
