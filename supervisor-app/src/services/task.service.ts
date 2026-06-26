import api from './api';

export const taskService = {
  list: (params?: any) => api.get('/tasks', { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/tasks/${id}/status`, data),
  approve: (id: string, data?: any) => api.patch(`/tasks/${id}/approve`, data),
  reject: (id: string, data: { reason: string }) => api.patch(`/tasks/${id}/reject`, data),
  requestRedo: (id: string, data: { reason: string }) => api.patch(`/tasks/${id}/redo`, data),
  assignCleaner: (id: string, data: { cleanerId: string }) => api.patch(`/tasks/${id}/assign`, data),
  getStats: () => api.get('/tasks/stats'),
  getDailyWork: (date: string) => api.get(`/tasks/daily/${date}`),
};

export default taskService;
