import api from './api';
import { ApiResponse, ComplaintData } from '../types/navigation';

const BASE = '/complaints';

export const complaintService = {
  list: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ComplaintData[]>> => {
    const res = await api.get(BASE, { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<ComplaintData>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: {
    bookingId?: string;
    subject: string;
    description: string;
    category: string;
    priority?: string;
  }): Promise<ApiResponse<ComplaintData>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await api.get(`${BASE}/stats`);
    return res.data;
  },
};
