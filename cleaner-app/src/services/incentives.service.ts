import api from './api';
import { ApiResponse, IncentiveData, LeaderboardEntry } from '../types/navigation';

const BASE = '/incentives';

export const incentivesService = {
  getIncentives: async (cleanerId: string, month?: number, year?: number): Promise<ApiResponse<IncentiveData[]>> => {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/${m}/${y}`);
    return res.data;
  },

  getLeaderboard: async (period?: 'month' | 'all'): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const res = await api.get(`${BASE}`, { params: { sort: '-totalAmount', limit: 20, period } });
    return res.data;
  },
};
