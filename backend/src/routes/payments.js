const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Payment verification
router.post('/verify', authenticate, paymentController.verifyPayment);

// Paystack webhook (no auth required)
router.post('/webhook', paymentController.handleWebhook);

// Transfer operations
router.post('/transfer-recipient', authenticate, paymentController.createTransferRecipient);
router.post('/transfer', authenticate, paymentController.initiateTransfer);
router.post('/finalize-transfer', authenticate, paymentController.finalizeTransfer);
router.post('/verify-account', authenticate, paymentController.verifyAccountNumber);

module.exports = router;
