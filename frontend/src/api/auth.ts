import apiClient from './client';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const authAPI = {
  register: (data: RegisterPayload) => apiClient.post('/auth/register/', data),
  login: (data: LoginPayload) => apiClient.post('/auth/login/', data),
  logout: (refresh: string) => apiClient.post('/auth/logout/', { refresh }),
  getProfile: () => apiClient.get('/auth/profile/'),
  updateProfile: (data: object) => apiClient.put('/auth/profile/', data),
  changePassword: (data: object) => apiClient.post('/auth/change-password/', data),
  getPublicProfile: (userId: number) => apiClient.get(`/auth/users/${userId}/`),
};
