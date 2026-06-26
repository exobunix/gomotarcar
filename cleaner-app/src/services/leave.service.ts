import api from './api';
import { ApiResponse, LeaveRequest, LeaveBalance } from '../types/navigation';

const BASE = '/leave';

export const leaveService = {
  list: async (cleanerId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<LeaveRequest[]>> => {
    const res = await api.get(BASE, { params: { ...params, cleanerId } });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  apply: async (data: { cleanerId: string; fromDate: string; toDate: string; reason: string; type: string }): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  getBalance: async (cleanerId: string): Promise<ApiResponse<LeaveBalance>> => {
    const res = await api.get(`${BASE}/balance/${cleanerId}`);
    return res.data;
  },
};
