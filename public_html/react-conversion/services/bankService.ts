import { api } from '../utils/api';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

interface AddBankRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const bankService = {
  getUserBanks: () => api.get('/api/user/banks'),
  addBank: (data: AddBankRequest) => api.post('/api/user/banks', data),
  deleteBank: (id: number) => api.delete(`/api/user/banks/${id}`),
  setDefaultBank: (id: number) => api.put(`/api/user/banks/${id}/default`)
};