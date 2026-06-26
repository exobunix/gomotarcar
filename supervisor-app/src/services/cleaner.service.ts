import api from './api';

export const cleanerService = {
  list: (params?: any) => api.get('/cleaner', { params }),
  getById: (id: string) => api.get(`/cleaner/${id}`),
  create: (data: any) => api.post('/cleaner', data),
  update: (id: string, data: any) => api.put(`/cleaner/${id}`, data),
  getStats: () => api.get('/cleaner/stats'),
  verify: (id: string) => api.patch(`/cleaner/${id}/verify`),
  deactivate: (id: string) => api.patch(`/cleaner/${id}/deactivate`),
};

export default cleanerService;
