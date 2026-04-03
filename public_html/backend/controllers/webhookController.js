const crypto = require('crypto');
const { Investment } = require('../models');
const InvestmentEngine = require('../services/InvestmentEngine');

const webhookController = {
  // Handle Paystack webhook
  handlePaystackWebhook: async (req, res) => {
    try {
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { event, data } = req.body;

      if (event === 'charge.success') {
        const { reference, metadata } = data;
        
        if (metadata && metadata.type === 'investment') {
          // Find the investment
          const investment = await Investment.findOne({
            where: { paymentReference: reference }
          });

          if (investment && investment.status === 'pending') {
            // Process successful payment
            await InvestmentEngine.processSuccessfulPayment(investment.id, data);
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
};

module.exports = webhookController;