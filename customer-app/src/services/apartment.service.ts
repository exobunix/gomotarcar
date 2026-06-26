import api from './api';
import { ApiResponse, ApartmentData } from '../types/navigation';

const BASE = '/apartments';

export const apartmentService = {
  listByCustomer: async (customerId: string): Promise<ApiResponse<ApartmentData[]>> => {
    const res = await api.get(`${BASE}/customer/${customerId}`);
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<ApartmentData>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: Omit<ApartmentData, '_id'>): Promise<ApiResponse<ApartmentData>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  update: async (id: string, data: Partial<ApartmentData>): Promise<ApiResponse<ApartmentData>> => {
    const res = await api.put(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },

  setDefault: async (id: string): Promise<ApiResponse<ApartmentData>> => {
    const res = await api.patch(`${BASE}/${id}/default`);
    return res.data;
  },
};
