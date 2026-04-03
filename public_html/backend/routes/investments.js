const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const webhookController = require('../controllers/webhookController');
const auth = require('../middleware/auth');

// Create new investment
router.post('/', auth, investmentController.createInvestment);

// Get user investments
router.get('/my-investments', auth, investmentController.getUserInvestments);

// Get recent activity
router.get('/recent', auth, investmentController.getRecentActivity);

// Verify payment
router.get('/verify-payment/:reference', auth, investmentController.verifyPayment);

// Get investment statistics
router.get('/stats', auth, investmentController.getInvestmentStats);

// Paystack webhook (no auth required)
router.post('/webhook/paystack', webhookController.handlePaystackWebhook);

module.exports = router;