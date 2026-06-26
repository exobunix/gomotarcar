import api from './api';

export const complaintService = {
  list: (params?: any) => api.get('/complaints', { params }),
  getById: (id: string) => api.get(`/complaints/${id}`),
  getByTicket: (ticketNumber: string) => api.get(`/complaints/ticket/${ticketNumber}`),
  create: (data: any) => api.post('/complaints', data),
  assign: (id: string, data: any) => api.patch(`/complaints/${id}/assign`, data),
  resolve: (id: string, data: any) => api.patch(`/complaints/${id}/resolve`, data),
  close: (id: string, data?: any) => api.patch(`/complaints/${id}/close`, data),
  updatePriority: (id: string, data: any) => api.patch(`/complaints/${id}/priority`, data),
  getStats: () => api.get('/complaints/stats'),
};

export default complaintService;
