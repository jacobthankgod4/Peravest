import { api } from '../utils/api';

export const dashboardService = {
  getUserStats: () => api.get('/api/user/dashboard/stats'),
  getRecentInvestments: () => api.get('/api/user/dashboard/recent-investments'),
  getPortfolioSummary: () => api.get('/api/user/dashboard/portfolio'),
  getAdminStats: () => api.get('/api/admin/dashboard/stats'),
  getRecentActivities: () => api.get('/api/admin/dashboard/activities')
};