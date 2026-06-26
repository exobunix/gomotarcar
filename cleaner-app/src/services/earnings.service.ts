import api from './api';
import { ApiResponse, EarningsSummary } from '../types/navigation';

const BASE = '/earnings';

export const earningsService = {
  getSummary: async (cleanerId: string): Promise<ApiResponse<EarningsSummary>> => {
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/summary`);
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<EarningsSummary>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  list: async (params?: { page?: number; limit?: number; cleanerId?: string }): Promise<ApiResponse<EarningsSummary[]>> => {
    const res = await api.get(BASE, { params });
    return res.data;
  },
};
