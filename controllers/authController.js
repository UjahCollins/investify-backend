const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

exports.register = async (req, res) => {
  const {
    username, email, country, phone, password, confirmPassword,
    firstName, lastName, address, zipCode, city
  } = req.body;

  try {
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
      });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username, email, country, phone,
      password: hashedPassword,
      firstName, lastName, address, zipCode, city
    });

    const token = crypto.randomBytes(32).toString('hex');
    newUser.verificationToken = token;
    await newUser.save();

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${token}`;
    await sendEmail(email, 'Verify Your Email', `
      <h2>Email Verification</h2>
      <p>Click the link to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `);

    return res.status(201).json({ message: 'User registered. Check your email to verify.' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.verified) return res.status(403).json({ message: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        kycStatus: user.kyc?.status || 'not submitted'
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};