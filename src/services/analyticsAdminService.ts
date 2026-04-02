import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const analyticsAdminService = {
  async getDashboardAnalytics(dateRange?: { start: string; end: string }) {
    const response = await axios.get(`${API_URL}/admin/analytics/dashboard`, { params: dateRange });
    return response.data;
  },

  async getRevenueReport(period: 'monthly' | 'quarterly' | 'yearly', year?: number) {
    const response = await axios.get(`${API_URL}/admin/analytics/revenue`, { params: { period, year } });
    return response.data;
  },

  async getUserActivityReport(dateRange?: { start: string; end: string }) {
    const response = await axios.get(`${API_URL}/admin/analytics/user-activity`, { params: dateRange });
    return response.data;
  },

  async getPropertyPerformance() {
    const response = await axios.get(`${API_URL}/admin/analytics/property-performance`);
    return response.data;
  },

  async exportReport(reportType: string, filters: any) {
    const response = await axios.post(`${API_URL}/admin/analytics/export`, { reportType, filters });
    return response.data;
  }
};
