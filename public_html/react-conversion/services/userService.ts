import { api } from '../utils/api';

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data: UpdateProfileRequest) => api.put('/api/user/profile', data),
  changePassword: (data: ChangePasswordRequest) => api.put('/api/user/change-password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};