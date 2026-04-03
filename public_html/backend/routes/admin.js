const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Dashboard stats
router.get('/stats', auth, adminAuth, adminController.getDashboardStats);

// Get all users
router.get('/users', auth, adminAuth, adminController.getAllUsers);

// Get all investments
router.get('/investments', auth, adminAuth, adminController.getAllInvestments);

// Update user status
router.put('/users/:userId/status', auth, adminAuth, adminController.updateUserStatus);

// Update investment status
router.put('/investments/:investmentId/status', auth, adminAuth, adminController.updateInvestmentStatus);

module.exports = router;