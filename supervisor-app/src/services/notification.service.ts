import api from './api';

export const notificationService = {
  list: (params?: any) => api.get('/notifications/me', { params }),
  getUnreadCount: () => api.get('/notifications/me/unread'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/me/read-all'),
  getStats: () => api.get('/notifications/stats'),
};

export default notificationService;
