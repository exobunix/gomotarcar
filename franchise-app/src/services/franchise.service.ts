import { api } from './api';

export const franchiseService = {
  async getDashboard(userId?: string) {
    const response: any = await api.get(userId ? `/dashboard/franchise/${userId}` : '/dashboard/franchise');
    return response;
  },

  async getProfile() {
    const response: any = await api.get('/auth/profile');
    return response;
  },

  async updateProfile(data: any) {
    const response: any = await api.put('/auth/profile', data);
    return response;
  },

  async getServices() {
    const response: any = await api.get('/bookings', { params: { limit: 20 } });
    return response;
  },

  async updateService(id: string, data: any) {
    const response: any = await api.patch(`/bookings/${id}/status`, data);
    return response;
  },
};
