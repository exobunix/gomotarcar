import api from './api';
import { ApiResponse, SubscriptionPlan, ActiveSubscription } from '../types/navigation';

const BASE = '/subscriptions';

export const subscriptionService = {
  getPlans: async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const res = await api.get(`${BASE}/packages`);
    return res.data;
  },

  getPlanById: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    const res = await api.get(`${BASE}/packages/${id}`);
    return res.data;
  },

  subscribe: async (data: {
    planId: string;
    vehicleId: string;
    apartmentId: string;
  }): Promise<ApiResponse<ActiveSubscription>> => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  getMySubscriptions: async (): Promise<ApiResponse<ActiveSubscription[]>> => {
    const res = await api.get(BASE, { params: { status: 'active' } });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<ActiveSubscription>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  cancel: async (id: string): Promise<ApiResponse<ActiveSubscription>> => {
    const res = await api.patch(`${BASE}/${id}/cancel`);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await api.get(`${BASE}/stats`);
    return res.data;
  },
};
