import apiClient from './client';

export const ordersAPI = {
  create: (data: object) => apiClient.post('/orders/create/', data),
  getAll: (params?: object) => apiClient.get('/orders/', { params }),
  getById: (id: number) => apiClient.get(`/orders/${id}/`),
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/orders/${id}/`, { status }),
};
