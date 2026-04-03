const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getProperty);

// Admin routes
router.post('/', authenticate, requireAdmin, 
  upload.fields([{ name: 'images', maxCount: 15 }, { name: 'videos', maxCount: 2 }]),
  propertyController.createProperty
);
router.put('/:id', authenticate, requireAdmin, propertyController.updateProperty);
router.delete('/:id', authenticate, requireAdmin, propertyController.deleteProperty);

module.exports = router;
