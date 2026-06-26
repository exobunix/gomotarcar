import api from './api';

export const supervisorService = {
  getProfile: () => api.get('/supervisor/profile'),
  updateProfile: (data: any) => api.put('/supervisor/profile', data),
  getDashboardStats: () => api.get('/supervisor/stats'),
  getCleaners: () => api.get('/supervisor/cleaners'),
};

export default supervisorService;
