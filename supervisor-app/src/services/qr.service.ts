import api from './api';

export const qrService = {
  list: (params?: any) => api.get('/qr', { params }),
  getById: (id: string) => api.get(`/qr/${id}`),
  getByCode: (code: string) => api.get(`/qr/code/${code}`),
  generate: (data: any) => api.post('/qr', data),
  activate: (id: string) => api.patch(`/qr/${id}/activate`),
  reportDamaged: (id: string, data?: any) => api.patch(`/qr/${id}/damaged`, data),
  replace: (id: string, data: any) => api.post(`/qr/${id}/replace`, data),
  scan: (data: any) => api.post('/qr/scan', data),
  getStats: () => api.get('/qr/stats'),
};

export default qrService;
