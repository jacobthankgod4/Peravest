import { api } from '../utils/api';

export const paymentService = {
  initialize: async (data: any) => {
    const response = await api.post('/api/payments/initialize', data);
    return response.data;
  },
  
  verify: async (reference: string) => {
    const response = await api.get(`/api/payments/verify/${reference}`);
    return response.data;
  },
  
  getPaystackPublicKey: () => {
    return process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '';
  }
};
