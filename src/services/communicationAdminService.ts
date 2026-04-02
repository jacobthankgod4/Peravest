import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const communicationAdminService = {
  async sendNotification(data: { user_ids: number[]; title: string; message: string; type: string }) {
    const response = await axios.post(`${API_URL}/admin/notifications/send`, data);
    return response.data;
  },

  async scheduleNotification(data: { user_ids: number[]; title: string; message: string; type: string; scheduled_at: string }) {
    const response = await axios.post(`${API_URL}/admin/notifications/schedule`, data);
    return response.data;
  },

  async getNotificationTemplates() {
    const response = await axios.get(`${API_URL}/admin/notifications/templates`);
    return response.data;
  },

  async createTemplate(data: { name: string; subject: string; body: string; type: string }) {
    const response = await axios.post(`${API_URL}/admin/notifications/templates`, data);
    return response.data;
  },

  async updateTemplate(id: number, data: any) {
    const response = await axios.put(`${API_URL}/admin/notifications/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: number) {
    const response = await axios.delete(`${API_URL}/admin/notifications/templates/${id}`);
    return response.data;
  }
};
