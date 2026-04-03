import { api } from '../utils/api';

class PaymentService {
  async initialize(data: {
    email: string;
    amount: number;
    callback_url?: string;
    metadata?: any;
  }) {
    return api.post('/payments/initialize', data);
  }

  async verify(reference: string) {
    return api.post('/payments/verify', { reference });
  }

  async initializeTransaction(amount: number, email: string, metadata: any) {
    return api.post('/payments/initialize', {
      amount,
      email,
      metadata,
    });
  }

  async verifyTransaction(reference: string) {
    return api.post('/payments/verify', { reference });
  }

  async processWithdrawal(withdrawalData: any) {
    return api.post('/payments/withdraw', withdrawalData);
  }

  async finalizeWithdrawal(transferCode: string, otp: string) {
    return api.post('/payments/finalize-withdrawal', {
      transferCode,
      otp,
    });
  }

  async getTransactionHistory(filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get(`/payments/history?${params.toString()}`);
  }

  async getPaymentMethods() {
    return api.get('/payments/methods');
  }

  async getBanks() {
    return api.get('/payments/banks');
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    return api.post('/payments/resolve-account', {
      accountNumber,
      bankCode
    });
  }

  getPaystackPublicKey() {
    return process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  }
}

export const paymentService = new PaymentService();
