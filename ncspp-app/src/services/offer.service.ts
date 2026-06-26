import { api } from './api';

export const offerService = {
  async getOffers(params?: any) {
    const response = await api.get('/offers', { params });
    return response.data;
  },

  async getOfferById(id: string) {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  async createOffer(data: any) {
    const response = await api.post('/offers', data);
    return response.data;
  },

  async updateOffer(id: string, data: any) {
    const response = await api.put(`/offers/${id}`, data);
    return response.data;
  },

  async deleteOffer(id: string) {
    const response = await api.delete(`/offers/${id}`);
    return response.data;
  },
};

export default offerService;
