const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createInvestment,
  getUserInvestments,
  verifyPayment,
  getInvestmentStats,
  paystackWebhook,
  createAjo,
  createTargetSavings,
  getAjo,
  getTargetSavings
} = require('../controllers/investmentController');

// Create new investment (authenticated users)
router.post('/', authenticate, createInvestment);

// Ajo endpoints
router.post('/ajo', authenticate, createAjo);
router.get('/ajo/:id', authenticate, getAjo);

// Target Savings endpoints
router.post('/target-savings', authenticate, createTargetSavings);
router.get('/target-savings/:id', authenticate, getTargetSavings);

// Get user's investments (authenticated users)
router.get('/my-investments', authenticate, getUserInvestments);

// Verify payment
router.post('/verify-payment', authenticate, verifyPayment);

// Paystack webhook (no auth required)
router.post('/webhook/paystack', paystackWebhook);

// Get investment statistics (admin only)
router.get('/stats', authenticate, requireAdmin, getInvestmentStats);

module.exports = router;