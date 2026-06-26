import api from './api';
import { ApiResponse, ReviewData } from '../types/navigation';

const BASE = '/bookings';

export const reviewService = {
  getMyReviews: async (): Promise<ApiResponse<ReviewData[]>> => {
    const res = await api.get(`${BASE}/reviews/my`);
    return res.data;
  },

  create: async (data: {
    bookingId: string;
    rating: number;
    comment?: string;
    punctuality?: number;
    quality?: number;
    behavior?: number;
  }): Promise<ApiResponse<ReviewData>> => {
    const res = await api.post(`${BASE}/${data.bookingId}/review`, data);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await api.get(`${BASE}/reviews/stats`);
    return res.data;
  },
};
