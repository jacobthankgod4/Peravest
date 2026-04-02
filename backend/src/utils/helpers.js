const crypto = require('crypto');

// Generate unique payment reference
exports.generatePaymentReference = () => {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `PV_${timestamp}_${random}`.toUpperCase();
};

// Calculate VAT (7.5%)
exports.calculateVAT = (amount) => {
  return Math.round(amount * 0.075 * 100) / 100;
};

// Calculate ROI based on investment period
exports.calculateROI = (period) => {
  if (period === 6) return 9.25;
  if (period === 12) return 18.5;
  return 0;
};