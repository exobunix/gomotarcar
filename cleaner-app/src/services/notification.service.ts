import api from './api';
import { ApiResponse, NotificationItem } from '../types/navigation';

const BASE = '/notifications';

export const notificationService = {
  listForUser: async (userId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<NotificationItem[]>> => {
    const res = await api.get(`${BASE}/user/${userId}`, { params });
    return res.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<NotificationItem>> => {
    const res = await api.patch(`${BASE}/${id}/read`);
    return res.data;
  },

  getUnreadCount: async (userId: string): Promise<ApiResponse<{ count: number }>> => {
    const res = await api.get(`${BASE}/user/${userId}/unread`);
    return res.data;
  },
};
