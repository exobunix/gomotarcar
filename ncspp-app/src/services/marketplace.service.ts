import api from './api';

export const marketplaceService = {
  listServices: (params?: any) => api.get('/services', { params }).then(r => r.data.data),
  getServiceById: (id: string) => api.get(`/services/${id}`).then(r => r.data.data),
  createService: (data: any) => api.post('/services', data).then(r => r.data.data),
  updateService: (id: string, data: any) => api.put(`/services/${id}`, data).then(r => r.data.data),
  deleteService: (id: string) => api.delete(`/services/${id}`).then(r => r.data.data),
  getOffers: (params?: any) => api.get('/offers', { params }).then(r => r.data.data),
  createOffer: (data: any) => api.post('/offers', data).then(r => r.data.data),
  updateOffer: (id: string, data: any) => api.put(`/offers/${id}`, data).then(r => r.data.data),
  deleteOffer: (id: string) => api.delete(`/offers/${id}`).then(r => r.data.data),
};

export default marketplaceService;
