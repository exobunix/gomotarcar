import api from './api';

export const apartmentService = {
  list: (params?: any) => api.get('/apartments', { params }),
  getById: (id: string) => api.get(`/apartments/${id}`),
  create: (data: any) => api.post('/apartments', data),
  update: (id: string, data: any) => api.put(`/apartments/${id}`, data),
  delete: (id: string) => api.delete(`/apartments/${id}`),
  listByCustomer: (customerId: string) => api.get(`/apartments/customer/${customerId}`),
};

export default apartmentService;
