import api from './api';

export const authService = {
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }).then(r => r.data.data),
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }).then(r => r.data.data),
  verifyOtp: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }).then(r => r.data.data),
  register: (data: any) => api.post('/auth/register', data).then(r => r.data.data),
  getProfile: () => api.get('/auth/profile').then(r => r.data.data),
  logout: () => api.post('/auth/logout'),
};

export default authService;
