const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);

router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).send('Invalid or expired token');

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.send('Email verified successfully. You can now login.');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
