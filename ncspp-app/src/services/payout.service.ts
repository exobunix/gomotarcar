import { api } from './api';

export const payoutService = {
  async getPayouts(params?: any) {
    const response = await api.get('/franchise/payouts', { params });
    return response.data;
  },

  async requestPayout(data: { amount: number; upiId?: string }) {
    const response = await api.post('/franchise/payouts', data);
    return response.data;
  },
};

export default payoutService;
