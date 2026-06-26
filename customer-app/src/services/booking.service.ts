import api from './api';
import { ApiResponse, ServiceBooking } from '../types/navigation';

const BASE = '/bookings';

export const bookingService = {
  create: async (data: {
    vehicleId: string;
    apartmentId: string;
    serviceType: string;
    packageName: string;
    amount: number;
    scheduledDate: string;
    scheduledTime: string;
    subscriptionId?: string;
    notes?: string;
  }): Promise<ApiResponse<ServiceBooking>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  list: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ServiceBooking[]>> => {
    const res = await api.get(BASE, { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<ServiceBooking>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  cancel: async (id: string): Promise<ApiResponse<ServiceBooking>> => {
    const res = await api.patch(`${BASE}/${id}/cancel`);
    return res.data;
  },

  getHistory: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<ServiceBooking[]>> => {
    const res = await api.get(BASE, { params: { ...params, status: 'completed,cancelled' } });
    return res.data;
  },
};
