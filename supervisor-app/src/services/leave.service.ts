import api from './api';

export const leaveService = {
  list: (params?: any) => api.get('/leave', { params }),
  getById: (id: string) => api.get(`/leave/${id}`),
  approve: (id: string, data?: any) => api.patch(`/leave/${id}/approve`, data),
  reject: (id: string, data?: any) => api.patch(`/leave/${id}/reject`, data),
  cancel: (id: string) => api.patch(`/leave/${id}/cancel`),
  getStats: () => api.get('/leave/stats'),
  getBalance: (cleanerId: string) => api.get(`/leave/balance/${cleanerId}`),
};

export default leaveService;
