import api from './api';

export const customerService = {
  list: (params?: any) => api.get('/customer', { params }),
  getById: (id: string) => api.get(`/customer/${id}`),
  create: (data: any) => api.post('/customer', data),
};

export default customerService;
