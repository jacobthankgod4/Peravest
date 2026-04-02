import { api } from '../utils/api';

export const bankService = {
  getBankAccounts: async () => {
    const response = await api.get('/api/bank-accounts');
    return response;
  },
  
  addBankAccount: async (data: any) => {
    const response = await api.post('/api/bank-accounts', data);
    return response;
  }
};
