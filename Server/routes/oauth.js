/*const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
console.log('here routes/oauth');
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`http://localhost:3000?token=${token}`);
});

module.exports = router;
*/