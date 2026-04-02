const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    // Temporarily bypass database check
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const adminOnly = async (req, res, next) => {
  const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
  
  if (rows.length === 0 || rows[0].role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  next();
};

module.exports = { authenticate: protect, requireAdmin: adminOnly };
