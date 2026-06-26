import api from './api';
import { ApiResponse, SupportTicket } from '../types/navigation';

const BASE = '/issues';

export const supportService = {
  createTicket: async (data: { subject: string; description: string; category: string; priority?: string }): Promise<ApiResponse<SupportTicket>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  getTickets: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<SupportTicket[]>> => {
    const res = await api.get(BASE, { params });
    return res.data;
  },

  getTicketById: async (id: string): Promise<ApiResponse<SupportTicket>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
};
