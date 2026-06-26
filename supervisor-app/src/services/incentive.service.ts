import api from './api';

export const incentiveService = {
  list: (params?: any) => api.get('/incentives', { params }),
  getById: (id: string) => api.get(`/incentives/${id}`),
  getByCleaner: (cleanerId: string, month: number, year: number) =>
    api.get(`/incentives/cleaner/${cleanerId}/${month}/${year}`),
  getLeaderboard: (params?: any) => api.get('/incentives/leaderboard', { params }),
  getStats: () => api.get('/incentives/stats'),
  calculateAll: (data: { month: number; year: number }) => api.post('/incentives/calculate-all', data),
  markPaid: (id: string, data: any) => api.patch(`/incentives/${id}/mark-paid`, data),
};

export default incentiveService;
