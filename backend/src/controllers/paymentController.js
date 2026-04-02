const axios = require('axios');
const crypto = require('crypto');
const pool = require('../config/database');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const userId = req.user?.id;

    if (!reference || !userId) {
      return res.status(400).json({ success: false, message: 'Missing reference or user' });
    }

    // Verify with Paystack
    const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`
      }
    });

    if (!response.data.status || response.data.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const paystackData = response.data.data;

    // Update transaction status
    await pool.query(
      'UPDATE public.payment_transactions SET "Status" = $1, "updated_at" = NOW() WHERE "PaystackReference" = $2',
      ['completed', reference]
    );

    res.json({ success: true, message: 'Payment verified', data: paystackData });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
    
    if (hash !== signature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const amount = event.data.amount / 100; // Convert from kobo

      // Update transaction
      const result = await pool.query(
        'UPDATE public.payment_transactions SET "Status" = $1, "updated_at" = NOW() WHERE "PaystackReference" = $2 RETURNING *',
        ['completed', reference]
      );

      if (result.rows.length > 0) {
        const transaction = result.rows[0];
        console.log(`Payment confirmed for transaction ${transaction.Id}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

exports.createTransferRecipient = async (req, res) => {
  try {
    const { accountNumber, bankCode, accountName } = req.body;

    const response = await axios.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`
      }
    });

    res.json({ status: response.data.status, data: response.data.data });
  } catch (error) {
    console.error('Transfer recipient error:', error);
    res.status(500).json({ status: false, message: error.response?.data?.message || 'Failed to create transfer recipient' });
  }
};

exports.initiateTransfer = async (req, res) => {
  try {
    const { amount, recipientCode, reason } = req.body;

    const response = await axios.post(`${PAYSTACK_BASE_URL}/transfer`, {
      source: 'balance',
      amount: amount * 100,
      recipient: recipientCode,
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`
      }
    });

    res.json({ status: response.data.status, data: response.data.data });
  } catch (error) {
    console.error('Transfer initiation error:', error);
    res.status(500).json({ status: false, message: error.response?.data?.message || 'Failed to initiate transfer' });
  }
};

exports.finalizeTransfer = async (req, res) => {
  try {
    const { transferCode, otp } = req.body;

    const response = await axios.post(`${PAYSTACK_BASE_URL}/transfer/finalize_transfer`, {
      transfer_code: transferCode,
      otp
    }, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`
      }
    });

    res.json({ status: response.data.status, data: response.data.data });
  } catch (error) {
    console.error('Transfer finalization error:', error);
    res.status(500).json({ status: false, message: error.response?.data?.message || 'Failed to finalize transfer' });
  }
};

exports.verifyAccountNumber = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;

    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
      params: {
        account_number: accountNumber,
        bank_code: bankCode
      },
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`
      }
    });

    res.json({ status: response.data.status, data: response.data.data });
  } catch (error) {
    console.error('Account verification error:', error);
    res.status(500).json({ status: false, message: error.response?.data?.message || 'Failed to verify account' });
  }
};

exports.logTransaction = async (userId, type, amount, reference, metadata = {}) => {
  try {
    await pool.query(
      'INSERT INTO public.payment_transactions ("UserId", "Type", "Amount", "PaystackReference", "Status", "Metadata") VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, type, amount, reference, 'pending', JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Transaction logging error:', error);
  }
};
