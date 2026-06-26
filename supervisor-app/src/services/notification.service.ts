import api from './api';

export const notificationService = {
  list: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getStats: () => api.get('/notifications/stats'),
};

export default notificationService;
