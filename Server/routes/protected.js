const express = require('express');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');



router.get('/profile', auth, async (req, res) => {
  console.log('here routes/protected');
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;
