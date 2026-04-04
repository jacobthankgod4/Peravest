/**
 * Payment Tracking Service
 * Manages payment transactions and status tracking
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

class PaymentTrackingService {
  /**
   * Create a new payment transaction
   */
  static async createTransaction({
    userId,
    amount,
    currency = 'NGN',
    txRef,
    customerEmail,
    customerName,
    investmentType,
    investmentId,
    propertyId,
    packageId,
    metadata = {}
  }) {
    try {
      const { data, error } = await supabase
        .from('flutterwave_transactions')
        .insert({
          user_id: userId,
          amount,
          currency,
          tx_ref: txRef,
          customer_email: customerEmail,
          customer_name: customerName,
          investment_type: investmentType,
          investment_id: investmentId,
          property_id: propertyId,
          package_id: packageId,
          metadata,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by reference
   */
  static async getTransactionByRef(txRef) {
    try {
      const { data, error } = await supabase
        .from('flutterwave_transactions')
        .select('*')
        .eq('tx_ref', txRef)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id) {
    try {
      const { data, error } = await supabase
        .from('flutterwave_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get user transactions
   */
  static async getUserTransactions(userId, limit = 50, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('flutterwave_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { transactions: data, total: count };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(transactionId, newStatus, reason = null) {
    try {
      const { data, error } = await supabase
        .from('flutterwave_transactions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;

      // Log status change
      await supabase
        .from('payment_status_log')
        .insert({
          transaction_id: transactionId,
          new_status: newStatus,
          reason
        });

      return data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Get transaction status history
   */
  static async getTransactionStatusHistory(transactionId) {
    try {
      const { data, error } = await supabase
        .from('payment_status_log')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting status history:', error);
      throw error;
    }
  }

  /**
   * Get transactions by status
   */
  static async getTransactionsByStatus(status, limit = 50, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('flutterwave_transactions')
        .select('*', { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { transactions: data, total: count };
    } catch (error) {
      console.error('Error getting transactions by status:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(userId) {
    try {
      const { data: transactions, error } = await supabase
        .from('flutterwave_transactions')
        .select('status, amount')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total_transactions: transactions.length,
        successful: transactions.filter(t => t.status === 'successful').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        total_amount: transactions
          .filter(t => t.status === 'successful')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      throw error;
    }
  }

  /**
   * Verify payment with Flutterwave
   */
  static async verifyPayment(transactionId) {
    try {
      const transaction = await this.getTransactionById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Call Flutterwave verification API
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        // Update transaction with verification data
        await supabase
          .from('flutterwave_transactions')
          .update({
            status: result.data.status,
            flw_ref: result.data.flw_ref,
            verified_at: new Date().toISOString(),
            processor_response: result.data.processor_response
          })
          .eq('id', transactionId);

        return result.data;
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Refund transaction
   */
  static async refundTransaction(transactionId, amount = null) {
    try {
      const transaction = await this.getTransactionById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const refundAmount = amount || transaction.amount;

      // Call Flutterwave refund API
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction.transaction_id}/refund`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount: refundAmount })
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        // Update transaction status
        await this.updateTransactionStatus(transactionId, 'refunded', 'Refund processed');
        return result.data;
      } else {
        throw new Error(result.message || 'Refund failed');
      }
    } catch (error) {
      console.error('Error refunding transaction:', error);
      throw error;
    }
  }

  /**
   * Get pending transactions (for reconciliation)
   */
  static async getPendingTransactions(hoursOld = 24) {
    try {
      const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('flutterwave_transactions')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', cutoffTime)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting pending transactions:', error);
      throw error;
    }
  }
}

module.exports = PaymentTrackingService;
