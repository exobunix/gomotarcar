import api from './api';
import { ApiResponse, PaymentData } from '../types/navigation';

const BASE = '/payments';

export const paymentService = {
  list: async (params?: {
    status?: string;
    purpose?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaymentData[]>> => {
    const res = await api.get(BASE, { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<PaymentData>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await api.get(`${BASE}/stats`);
    return res.data;
  },
};
