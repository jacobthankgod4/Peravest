const Investment = require('../models/Investment');
const Property = require('../models/Property');
const User = require('../models/User');
const { generatePaymentReference } = require('../utils/helpers');
const crypto = require('crypto');
const https = require('https');

// Create new investment
exports.createInvestment = async (req, res) => {
  try {
    const { property_id, shares_purchased, investment_period } = req.body;
    const user_id = req.user.id;

    // Get property details
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if enough shares available
    if (property.available_shares < shares_purchased) {
      return res.status(400).json({ error: 'Not enough shares available' });
    }

    // Calculate investment amounts
    const amount_invested = property.share_cost * shares_purchased;
    const vat_amount = amount_invested * 0.075; // 7.5% VAT
    const total_amount = amount_invested + vat_amount;

    // Calculate expected return based on period
    let interest_rate;
    if (investment_period === 6) {
      interest_rate = 9.25;
    } else if (investment_period === 12) {
      interest_rate = 18.5;
    } else {
      return res.status(400).json({ error: 'Invalid investment period' });
    }

    const expected_return = amount_invested * (interest_rate / 100);
    const maturity_date = new Date();
    maturity_date.setMonth(maturity_date.getMonth() + investment_period);

    // Generate payment reference
    const payment_reference = generatePaymentReference();

    // Create investment record
    const investment = await Investment.create({
      user_id,
      property_id,
      shares_purchased,
      amount_invested,
      vat_amount,
      total_amount,
      payment_reference,
      investment_period,
      expected_return,
      maturity_date
    });

    res.status(201).json({
      investment,
      payment_reference,
      total_amount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user investments
exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Property,
          attributes: ['title', 'address', 'images']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify payment and complete investment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    // Find investment by payment reference
    const investment = await Investment.findOne({
      where: { payment_reference: reference }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Update investment status
    await investment.update({ payment_status: 'completed' });

    // Update property available shares
    const property = await Property.findByPk(investment.property_id);
    await property.update({
      available_shares: property.available_shares - investment.shares_purchased
    });

    res.json({ message: 'Payment verified successfully', investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get investment statistics (admin)
exports.getInvestmentStats = async (req, res) => {
  try {
    const totalInvestments = await Investment.count();
    const totalAmount = await Investment.sum('total_amount');
    const activeInvestments = await Investment.count({
      where: { status: 'active' }
    });

    res.json({
      totalInvestments,
      totalAmount,
      activeInvestments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Paystack webhook handler
exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const investment = await Investment.findOne({
        where: { payment_reference: data.reference }
      });

      if (investment) {
        await investment.update({ payment_status: 'completed' });
        
        const property = await Property.findByPk(investment.property_id);
        await property.update({
          available_shares: property.available_shares - investment.shares_purchased
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};