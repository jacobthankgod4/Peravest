import api from '../utils/api';

export const withdrawalService = {
  create: async (data: any) => {
    const response = await api.post('/withdrawals', data);
    return response.data;
  },

  getUserWithdrawals: async () => {
    const response = await api.get('/withdrawals/user');
    return response.data;
  },

  getAllWithdrawals: async (status?: string) => {
    const response = await api.get('/withdrawals', { params: { status } });
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/withdrawals/${id}`, { status });
    return response.data;
  }
};
