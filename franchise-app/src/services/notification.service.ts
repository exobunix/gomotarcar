import { api } from './api';

export const notificationService = {
  getNotifications: async (params?: any) => {
    return api.get('/notifications', { params });
  },
  markAsRead: async (id: string) => {
    return api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async (userId: string) => {
    return api.patch(`/notifications/user/${userId}/read-all`);
  },
  getUnreadCount: async (userId: string) => {
    return api.get(`/notifications/user/${userId}/unread`);
  },
};
