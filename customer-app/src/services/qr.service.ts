import api from './api';
import { ApiResponse, QRCodeData } from '../types/navigation';

const BASE = '/qr';

export const qrService = {
  list: async (): Promise<ApiResponse<QRCodeData[]>> => {
    const res = await api.get(BASE);
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<QRCodeData>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  getByCode: async (code: string): Promise<ApiResponse<QRCodeData>> => {
    const res = await api.get(`${BASE}/code/${code}`);
    return res.data;
  },

  activate: async (id: string): Promise<ApiResponse<QRCodeData>> => {
    const res = await api.patch(`${BASE}/${id}/activate`);
    return res.data;
  },

  reportDamaged: async (id: string): Promise<ApiResponse<QRCodeData>> => {
    const res = await api.patch(`${BASE}/${id}/damaged`);
    return res.data;
  },

  replace: async (id: string): Promise<ApiResponse<QRCodeData>> => {
    const res = await api.post(`${BASE}/${id}/replace`);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await api.get(`${BASE}/stats`);
    return res.data;
  },
};
