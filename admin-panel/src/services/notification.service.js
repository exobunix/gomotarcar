import api from './api';

const notificationApi = {
  list: (params) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page);
    if (params?.limit) query.set('limit', params.limit);
    return api.get(`/notifications?${query.toString()}`);
  },
  send: (data) => api.post('/notifications', data),
  sendBulk: (data) => api.post('/notifications/bulk', data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getStats: () => api.get('/notifications/stats'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default notificationApi;
