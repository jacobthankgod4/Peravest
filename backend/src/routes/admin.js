const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Dashboard
router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboardData);

// Property Management
router.get('/properties', authenticate, requireAdmin, adminController.getAdminProperties);
router.get('/properties/:id', authenticate, requireAdmin, adminController.getPropertyById);
router.post('/properties', authenticate, requireAdmin,
  upload.fields([{ name: 'images', maxCount: 15 }]),
  adminController.createPropertyWithPackages
);
router.patch('/properties/:id', authenticate, requireAdmin, adminController.updateProperty);
router.patch('/properties/:id/status', authenticate, requireAdmin, adminController.updatePropertyStatus);
router.get('/properties/:id/analytics', authenticate, requireAdmin, adminController.getPropertyAnalytics);

module.exports = router;