import api from './api';

export const notificationService = {
  list: (params?: any) => api.get('/notifications', { params }).then(r => r.data.data),
  getUnreadCount: () => api.get('/notifications/unread').then(r => r.data.data),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

export default notificationService;
