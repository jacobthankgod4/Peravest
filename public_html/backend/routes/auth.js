const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { sendEmail } = require('../utils/email');
const { validateEmail, validatePassword } = require('../utils/validation');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password: hashedPassword,
      activation_token: activationToken,
      is_active: false
    });

    // Send activation email
    const activationUrl = `${process.env.FRONTEND_URL}/activate-account?token=${activationToken}`;
    await sendEmail({
      to: email,
      subject: 'Activate Your Account',
      template: 'activation',
      data: { firstName, activationUrl }
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to activate your account.',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Please activate your account first' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isAdmin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Activate account
router.post('/activate', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ where: { activation_token: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid activation token' });
    }

    await user.update({
      is_active: true,
      activation_token: null,
      email_verified_at: new Date()
    });

    res.json({ message: 'Account activated successfully' });

  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({ message: 'Account activation failed' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      reset_token: resetToken,
      reset_expires: resetExpires
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: { firstName: user.first_name, resetUrl }
    });

    res.json({ message: 'Password reset email sent' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' 
      });
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_expires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_expires: null
    });

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;