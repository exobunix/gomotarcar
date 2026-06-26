import { api } from './api';

export const bookingService = {
  async list(params?: any) {
    const response: any = await api.get('/bookings', { params });
    return response;
  },

  async getById(id: string) {
    const response: any = await api.get(`/bookings/${id}`);
    return response;
  },

  async updateStatus(id: string, status: string, note?: string) {
    const response: any = await api.patch(`/bookings/${id}/status`, { status, note });
    return response;
  },

  async addExtraCharge(id: string, data: { item: string; amount: number }) {
    const response: any = await api.post(`/bookings/${id}/extra-charges`, data);
    return response;
  },

  async generateJobCard(id: string) {
    const response: any = await api.post(`/bookings/${id}/job-card`);
    return response;
  },

  async cancel(id: string, reason?: string) {
    const response: any = await api.patch(`/bookings/${id}/cancel`, { reason });
    return response;
  },
};
