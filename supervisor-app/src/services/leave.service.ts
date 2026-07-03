import api from './api';

export const leaveService = {
  list: (params?: any) => api.get('/leaves', { params }),
  getById: (id: string) => api.get(`/leaves/${id}`),
  approve: (id: string, data?: any) => api.patch(`/leaves/${id}/approve`, data),
  reject: (id: string, data?: any) => api.patch(`/leaves/${id}/reject`, data),
  cancel: (id: string) => api.patch(`/leaves/${id}/cancel`),
  getStats: () => api.get('/leaves/stats'),
  getBalance: (cleanerId: string) => api.get(`/leaves/balance/${cleanerId}`),
};

export default leaveService;
