const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Change password
router.put('/change-password', auth, userController.changePassword);

// Get dashboard data
router.get('/dashboard', auth, userController.getDashboard);

module.exports = router;