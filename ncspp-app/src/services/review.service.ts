import { api } from './api';

export const reviewService = {
  async getReviews(params?: any) {
    const response = await api.get('/franchise/reviews', { params });
    return response.data;
  },

  async replyToReview(id: string, reply: string) {
    const response = await api.post(`/franchise/reviews/${id}/reply`, { reply });
    return response.data;
  },
};

export default reviewService;
