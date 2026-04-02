const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');
const { sendEmail, generateToken } = require('../utils/helpers');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, bankName, accountNumber, accountName } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = generateToken();

    const [result] = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, bank_name, account_number, account_name, activation_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [email, hashedPassword, firstName, lastName, phone, bankName, accountNumber, accountName, activationToken]
    );

    await sendEmail({
      to: email,
      subject: 'Activate Your Account',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/activate?token=${activationToken}">here</a> to activate your account.</p>`
    });

    res.status(201).json({ success: true, message: 'Registration successful. Check your email to activate your account.' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Please activate your account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = generateToken();
    await db.query('UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?', [resetToken, email]);

    await sendEmail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">here</a> to reset your password.</p>`
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const [users] = await db.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, users[0].id]);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.activateAccount = async (req, res, next) => {
  try {
    const { token } = req.body;

    const [users] = await db.query('SELECT id FROM users WHERE activation_token = ?', [token]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid activation token' });
    }

    await db.query('UPDATE users SET is_active = 1, activation_token = NULL WHERE id = ?', [users[0].id]);

    res.json({ success: true, message: 'Account activated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.query;

    const [users] = await db.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

    res.json({ success: users.length > 0 });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};
