import api from './api';
import { ApiResponse, AuthTokens } from '../types/navigation';

const BASE = '/auth';

interface UserData {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
}

export const authService = {
  sendOtp: async (phone: string): Promise<ApiResponse<{ expiresIn: number }>> => {
    const res = await api.post(`${BASE}/send-otp`, { phone });
    return res.data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<ApiResponse<{ verified: boolean; token?: string }>> => {
    const res = await api.post(`${BASE}/verify-otp`, { phone, otp });
    return res.data;
  },

  register: async (data: {
    phone: string;
    name: string;
    email?: string;
  }): Promise<ApiResponse<{ user: UserData; tokens: AuthTokens }>> => {
    const res = await api.post(`${BASE}/register`, data);
    return res.data;
  },

  login: async (phone: string, password: string): Promise<ApiResponse<{ user: UserData; tokens: AuthTokens }>> => {
    const res = await api.post(`${BASE}/login`, { phone, password });
    return res.data;
  },

  getProfile: async (): Promise<ApiResponse<UserData>> => {
    const res = await api.get(`${BASE}/profile`);
    return res.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const res = await api.post(`${BASE}/logout`);
    return res.data;
  },
};
