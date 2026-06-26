import api from './api';

export const authService = {
  login: async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    return res.data.data;
  },
  sendOtp: async (phone: string) => {
    const res = await api.post('/auth/send-otp', { phone });
    return res.data.data;
  },
  verifyOtp: async (phone: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    return res.data.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

export default authService;
