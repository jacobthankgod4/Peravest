const crypto = require('crypto');

const generatePaymentReference = () => {
  return 'PV_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

const calculateVAT = (amount, vatRate = 0.075) => {
  return Math.round(amount * vatRate);
};

const calculateROI = (period) => {
  const rates = {
    6: 9.25,
    12: 18.5,
    24: 37.0
  };
  return rates[period] || 0;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

module.exports = {
  generatePaymentReference,
  calculateVAT,
  calculateROI,
  formatCurrency
};