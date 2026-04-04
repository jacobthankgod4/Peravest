import { api } from '../utils/api';

export const flutterwaveService = {
  initialize: async (data: any) => {
    const response = await api.post('/api/payments/initialize', data);
    return response.data;
  },
  
  verify: async (transactionId: string) => {
    const response = await api.get(`/api/payments/verify/${transactionId}`);
    return response.data;
  },
  
  getFlutterwavePublicKey: () => {
    return process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || '';
  }
};
