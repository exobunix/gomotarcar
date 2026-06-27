import api from './api';
import { ApiResponse, AuthTokens, CleanerProfile } from '../types/navigation';

const BASE = '/auth';

export const authService = {
  login: async (phone: string, password: string): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string }; user: any; profile: any }>> => {
    const res = await api.post(`${BASE}/login`, { phone, password });
    return res.data;
  },

  sendOtp: async (phone: string): Promise<ApiResponse<{ expiresIn: number }>> => {
    const res = await api.post(`${BASE}/send-otp`, { phone });
    return res.data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<ApiResponse<{ verified: boolean; token?: string }>> => {
    const res = await api.post(`${BASE}/verify-otp`, { phone, otp });
    return res.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const res = await api.get(`${BASE}/profile`);
    return res.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const res = await api.post(`${BASE}/logout`);
    return res.data;
  },
};
