import { api } from './api';

export const leadService = {
  async getLeads(params?: any) {
    const response = await api.get('/franchise/leads', { params });
    return response.data;
  },

  async getLeadById(id: string) {
    const response = await api.get(`/franchise/leads/${id}`);
    return response.data;
  },

  async updateLeadStatus(id: string, status: string, notes?: string) {
    const response = await api.patch(`/franchise/leads/${id}/status`, { status, notes });
    return response.data;
  },

  async getAnalytics(params?: any) {
    const response = await api.get('/franchise/leads/analytics', { params });
    return response.data;
  },
};

export default leadService;
