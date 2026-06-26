import api from './api';
import { ApiResponse, EarningsSummary } from '../types/navigation';

export const cleanerService = {
  getDashboard: async (userId: string): Promise<ApiResponse<any>> => {
    const res = await api.get(`/dashboard/cleaner/${userId}`);
    return res.data;
  },

  getEarnings: async (cleanerId: string, params?: { period?: 'today' | 'week' | 'month' }): Promise<ApiResponse<any>> => {
    const res = await api.get(`/earnings/cleaner/${cleanerId}/summary`, { params });
    return res.data;
  },
};
