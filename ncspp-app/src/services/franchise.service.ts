import api from './api';

export const franchiseService = {
  getProfile: () => api.get('/franchise/profile').then(r => r.data.data),
  updateProfile: (data: any) => api.put('/franchise/profile', data).then(r => r.data.data),
  getDashboardStats: () => api.get('/franchise/stats').then(r => r.data.data),
  getLeads: (params?: any) => api.get('/franchise/leads', { params }).then(r => r.data.data),
  updateLeadStatus: (id: string, data: any) => api.patch(`/franchise/leads/${id}`, data).then(r => r.data.data),
  getWallet: () => api.get('/franchise/wallet').then(r => r.data.data),
  getServices: () => api.get('/franchise/services').then(r => r.data.data),
  verifyGst: (gstNumber: string) => api.post('/franchise/verify-gst', { gstNumber }).then(r => r.data.data),
};

export default franchiseService;
