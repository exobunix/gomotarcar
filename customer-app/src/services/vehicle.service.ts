import api from './api';
import { ApiResponse, VehicleData } from '../types/navigation';

const BASE = '/vehicles';

export const vehicleService = {
  listByCustomer: async (customerId: string): Promise<ApiResponse<VehicleData[]>> => {
    const res = await api.get(`${BASE}/customer/${customerId}`);
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<VehicleData>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: Omit<VehicleData, '_id'>): Promise<ApiResponse<VehicleData>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  update: async (id: string, data: Partial<VehicleData>): Promise<ApiResponse<VehicleData>> => {
    const res = await api.put(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },

  getByNumber: async (number: string): Promise<ApiResponse<VehicleData>> => {
    const res = await api.get(`${BASE}/number/${encodeURIComponent(number)}`);
    return res.data;
  },
};
