/**
 * Flutterwave Webhook Handler
 * Handles payment callbacks from Flutterwave
 * 
 * Webhook URL: POST /api/webhooks/flutterwave
 * Documentation: https://developer.flutterwave.com/docs/webhooks/
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { sendPaymentConfirmationEmail, sendPaymentFailureEmail } = require('../utils/emailService');

const FLUTTERWAVE_SECRET_KEY = process.env.REACT_APP_FLUTTERWAVE_SECRET_KEY || '';
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const hash = crypto
      .createHmac('sha256', FLUTTERWAVE_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (transaction) => {
  try {
    // Update transaction status
    await supabase
      .from('flutterwave_transactions')
      .update({
        status: 'successful',
        verified_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    // Process investment based on type
    if (transaction.investment_type === 'property') {
      await processPropertyInvestment(transaction);
    } else if (transaction.investment_type === 'ajo') {
      await processAjoPayment(transaction);
    } else if (transaction.investment_type === 'target-savings') {
      await processTargetSavingsPayment(transaction);
    } else if (transaction.investment_type === 'safelock') {
      await processSafeLockPayment(transaction);
    }

    // Send confirmation email
    await sendPaymentConfirmationEmail({
      email: transaction.customer_email,
      name: transaction.customer_name,
      amount: transaction.amount,
      reference: transaction.tx_ref,
      type: transaction.investment_type
    });

    console.log(`Payment successful: ${transaction.tx_ref}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailure = async (transaction) => {
  try {
    // Update transaction status
    await supabase
      .from('flutterwave_transactions')
      .update({
        status: 'failed',
        verified_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    // Send failure notification email
    await sendPaymentFailureEmail({
      email: transaction.customer_email,
      name: transaction.customer_name,
      amount: transaction.amount,
      reference: transaction.tx_ref,
      reason: transaction.processor_response
    });

    console.log(`Payment failed: ${transaction.tx_ref}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

/**
 * Process property investment payment
 */
const processPropertyInvestment = async (transaction) => {
  try {
    const { error } = await supabase
      .from('invest_now')
      .insert({
        Usa_Id: transaction.user_id,
        proptee_id: transaction.property_id,
        package_id: transaction.package_id,
        share_cost: transaction.amount,
        start_date: new Date().toISOString(),
        payment_status: 'completed',
        payment_reference: transaction.tx_ref,
        status: 'active'
      });

    if (error) throw error;
    console.log(`Property investment processed: ${transaction.tx_ref}`);
  } catch (error) {
    console.error('Error processing property investment:', error);
    throw error;
  }
};

/**
 * Process Ajo payment
 */
const processAjoPayment = async (transaction) => {
  try {
    const metadata = transaction.metadata || {};
    
    const { error } = await supabase
      .from('ajo_savings')
      .insert({
        user_id: transaction.user_id,
        ajo_type: metadata.ajoType || 'personal',
        contribution_amount: transaction.amount,
        frequency: metadata.frequency || 'monthly',
        duration: metadata.duration || 6,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (metadata.duration || 6) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_commitment: transaction.amount * (metadata.duration || 6),
        current_balance: transaction.amount,
        status: 'active',
        payment_reference: transaction.tx_ref,
        payment_status: 'completed'
      });

    if (error) throw error;
    console.log(`Ajo payment processed: ${transaction.tx_ref}`);
  } catch (error) {
    console.error('Error processing Ajo payment:', error);
    throw error;
  }
};

/**
 * Process target savings payment
 */
const processTargetSavingsPayment = async (transaction) => {
  try {
    const metadata = transaction.metadata || {};
    
    const { error } = await supabase
      .from('target_savings')
      .insert({
        user_id: transaction.user_id,
        goal_name: metadata.goalName || 'Savings Goal',
        target_amount: metadata.targetAmount || transaction.amount,
        current_amount: transaction.amount,
        monthly_contribution: transaction.amount,
        target_date: metadata.targetDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        interest_rate: metadata.interestRate || 12,
        status: 'active',
        auto_debit: false
      });

    if (error) throw error;
    console.log(`Target savings payment processed: ${transaction.tx_ref}`);
  } catch (error) {
    console.error('Error processing target savings payment:', error);
    throw error;
  }
};

/**
 * Process SafeLock payment
 */
const processSafeLockPayment = async (transaction) => {
  try {
    const metadata = transaction.metadata || {};
    
    const { error } = await supabase
      .from('safelock')
      .insert({
        user_id: transaction.user_id,
        amount: transaction.amount,
        lock_period: metadata.lockPeriod || 6,
        interest_rate: metadata.interestRate || 12,
        start_date: new Date().toISOString(),
        maturity_date: new Date(Date.now() + (metadata.lockPeriod || 6) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      });

    if (error) throw error;
    console.log(`SafeLock payment processed: ${transaction.tx_ref}`);
  } catch (error) {
    console.error('Error processing SafeLock payment:', error);
    throw error;
  }
};

/**
 * Main webhook handler
 * POST /api/webhooks/flutterwave
 */
router.post('/flutterwave', async (req, res) => {
  try {
    const signature = req.headers['x-flutterwave-signature'];
    const payload = req.body;

    // Verify signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = payload;

    console.log(`Webhook received: ${event}`, { data });

    // Handle different events
    if (event === 'charge.completed') {
      // Get transaction from database
      const { data: transaction } = await supabase
        .from('flutterwave_transactions')
        .select('*')
        .eq('tx_ref', data.tx_ref)
        .single();

      if (!transaction) {
        console.warn(`Transaction not found: ${data.tx_ref}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Update with Flutterwave response data
      await supabase
        .from('flutterwave_transactions')
        .update({
          transaction_id: data.id,
          flw_ref: data.flw_ref,
          status: data.status,
          processor_response: data.processor_response,
          charged_amount: data.charged_amount,
          app_fee: data.app_fee,
          merchant_fee: data.merchant_fee
        })
        .eq('tx_ref', data.tx_ref);

      // Handle payment success
      if (data.status === 'successful') {
        await handlePaymentSuccess(transaction);
      } else {
        await handlePaymentFailure(transaction);
      }

      return res.status(200).json({ success: true });
    }

    if (event === 'charge.failed') {
      const { data: transaction } = await supabase
        .from('flutterwave_transactions')
        .select('*')
        .eq('tx_ref', data.tx_ref)
        .single();

      if (transaction) {
        await handlePaymentFailure(transaction);
      }

      return res.status(200).json({ success: true });
    }

    // Acknowledge other events
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
