import { api } from '../utils/api';

class AuthService {
  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  }

  async logout() {
    await api.post('/api/auth/logout');
  }

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  }

  async activateAccount(token: string) {
    const response = await api.post('/api/auth/activate', { token });
    return response.data;
  }
}

export const authService = new AuthService();
