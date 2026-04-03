import { api } from '../utils/api';

class AuthService {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData: any) {
    return api.post('/auth/register', userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async activateAccount(token: string) {
    return api.post('/auth/activate', { token });
  }

  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return api.post('/auth/reset-password', { token, password });
  }

  async getBanks() {
    return api.get('/auth/banks');
  }

  async getCurrentUser() {
    return api.get('/auth/me');
  }

  async refreshToken() {
    return api.post('/auth/refresh');
  }

  async verifyEmail(token: string) {
    return api.post('/auth/verify-email', { token });
  }

  async resendVerification(email: string) {
    return api.post('/auth/resend-verification', { email });
  }

  getCurrentToken() {
    return localStorage.getItem('token');
  }

  getCurrentUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated() {
    return !!this.getCurrentToken();
  }
}

export const authService = new AuthService();
