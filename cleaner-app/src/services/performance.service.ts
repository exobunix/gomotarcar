import api from './api';
import { ApiResponse, PerformanceData, Achievement } from '../types/navigation';

const BASE = '/performance';

export const performanceService = {
  getPerformance: async (cleanerId: string, period?: 'week' | 'month' | 'all'): Promise<ApiResponse<PerformanceData>> => {
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/performance`, { params: { period } });
    return res.data;
  },

  getAchievements: async (cleanerId: string): Promise<ApiResponse<Achievement[]>> => {
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/achievements`);
    return res.data;
  },
};
