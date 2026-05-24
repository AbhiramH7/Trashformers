import apiClient from './client';

export const listingsAPI = {
  getAll: (params?: object) => apiClient.get('/listings/', { params }),
  getById: (id: number) => apiClient.get(`/listings/${id}/`),
  getMyListings: () => apiClient.get('/listings/mine/'),
  getCategories: () => apiClient.get('/listings/categories/'),
  create: (data: FormData) =>
    apiClient.post('/listings/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: object) => apiClient.put(`/listings/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/listings/${id}/`),
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/listings/${id}/status/`, { status }),
};
