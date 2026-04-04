/**
 * Flutterwave Payment Service
 * Based on: https://developer.flutterwave.com/docs/getting-started
 * 
 * Flutterwave API Reference:
 * - Initialize Payment: POST /v3/payments
 * - Verify Payment: GET /v3/transactions/{id}/verify
 * - Webhook: POST /webhook (with signature verification)
 */

import axios from 'axios';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
const FLUTTERWAVE_PUBLIC_KEY = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || '';
const FLUTTERWAVE_SECRET_KEY = process.env.REACT_APP_FLUTTERWAVE_SECRET_KEY || '';

interface FlutterwavePaymentConfig {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    name?: string;
    phone_number?: string;
  };
  customizations: {
    title: string;
    description?: string;
    logo?: string;
  };
  redirect_url?: string;
  meta?: Record<string, any>;
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip_address: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      email: string;
      phone_number: string;
      created_at: string;
    };
  };
}

export const flutterwaveService = {
  /**
   * Get Flutterwave public key for frontend
   */
  getPublicKey: (): string => {
    return FLUTTERWAVE_PUBLIC_KEY;
  },

  /**
   * Initialize payment - returns link for inline payment
   * https://developer.flutterwave.com/docs/payments/inline-payment
   */
  initializePayment: async (config: FlutterwavePaymentConfig): Promise<any> => {
    try {
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/payments`,
        config,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        return {
          status: 'success',
          data: {
            link: response.data.data.link,
            reference: config.tx_ref
          }
        };
      } else {
        throw new Error(response.data.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Flutterwave initialization error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Payment initialization failed');
    }
  },

  /**
   * Verify payment transaction
   * https://developer.flutterwave.com/docs/payments/verify-payment
   */
  verifyPayment: async (transactionId: string): Promise<FlutterwaveVerifyResponse> => {
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Flutterwave verification error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Payment verification failed');
    }
  },

  /**
   * Verify webhook signature
   * https://developer.flutterwave.com/docs/webhooks/
   */
  verifyWebhookSignature: (payload: any, signature: string): boolean => {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', FLUTTERWAVE_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  },

  /**
   * Get transaction details
   * https://developer.flutterwave.com/docs/payments/get-transaction-details
   */
  getTransactionDetails: async (transactionId: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get transaction details');
      }
    } catch (error: any) {
      console.error('Get transaction details error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get transaction details');
    }
  },

  /**
   * Refund transaction
   * https://developer.flutterwave.com/docs/payments/refunds
   */
  refundTransaction: async (transactionId: string, amount?: number): Promise<any> => {
    try {
      const payload: any = {};
      if (amount) {
        payload.amount = amount;
      }

      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/refund`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Refund failed');
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Refund failed');
    }
  },

  /**
   * Get list of banks for transfers
   * https://developer.flutterwave.com/docs/transfers/get-banks
   */
  getBanks: async (country: string = 'NG'): Promise<any[]> => {
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/banks/${country}`,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get banks');
      }
    } catch (error: any) {
      console.error('Get banks error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get banks');
    }
  },

  /**
   * Verify account number
   * https://developer.flutterwave.com/docs/transfers/verify-account-number
   */
  verifyAccountNumber: async (accountNumber: string, bankCode: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/accounts/resolve`,
        {
          params: {
            account_number: accountNumber,
            bank_code: bankCode
          },
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Account verification failed');
      }
    } catch (error: any) {
      console.error('Account verification error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Account verification failed');
    }
  },

  /**
   * Initiate transfer
   * https://developer.flutterwave.com/docs/transfers/initiate-transfer
   */
  initiateTransfer: async (transferData: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration: string;
    currency?: string;
    reference?: string;
  }): Promise<any> => {
    try {
      const payload = {
        ...transferData,
        currency: transferData.currency || 'NGN'
      };

      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/transfers`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Transfer initiation failed');
      }
    } catch (error: any) {
      console.error('Transfer initiation error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Transfer initiation failed');
    }
  }
};
