/**
 * Payment Service - Abstraction layer for payment processing
 * Currently uses Flutterwave as payment gateway
 */

import { flutterwaveService } from './flutterwaveService';

export const paymentService = {
  /**
   * Get payment gateway public key
   */
  getPublicKey: (): string => {
    return flutterwaveService.getPublicKey();
  },

  /**
   * Initialize payment transaction
   */
  initializePayment: async (config: {
    tx_ref: string;
    amount: number;
    currency?: string;
    payment_options?: string;
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
  }): Promise<any> => {
    return flutterwaveService.initializePayment({
      ...config,
      currency: config.currency || 'NGN',
      payment_options: config.payment_options || 'card,mobilemoney,ussd'
    });
  },

  /**
   * Verify payment transaction
   */
  verifyPayment: async (transactionId: string): Promise<any> => {
    return flutterwaveService.verifyPayment(transactionId);
  },

  /**
   * Get transaction details
   */
  getTransactionDetails: async (transactionId: string): Promise<any> => {
    return flutterwaveService.getTransactionDetails(transactionId);
  },

  /**
   * Refund transaction
   */
  refundTransaction: async (transactionId: string, amount?: number): Promise<any> => {
    return flutterwaveService.refundTransaction(transactionId, amount);
  },

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature: (payload: any, signature: string): boolean => {
    return flutterwaveService.verifyWebhookSignature(payload, signature);
  },

  /**
   * Get list of banks
   */
  getBanks: async (country?: string): Promise<any[]> => {
    return flutterwaveService.getBanks(country);
  },

  /**
   * Verify account number
   */
  verifyAccountNumber: async (accountNumber: string, bankCode: string): Promise<any> => {
    return flutterwaveService.verifyAccountNumber(accountNumber, bankCode);
  },

  /**
   * Initiate transfer
   */
  initiateTransfer: async (transferData: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration: string;
    currency?: string;
    reference?: string;
  }): Promise<any> => {
    return flutterwaveService.initiateTransfer(transferData);
  }
};
