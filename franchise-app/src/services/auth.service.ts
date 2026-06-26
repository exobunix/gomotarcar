import { api } from './api';

export const authService = {
  async login(phone: string, password: string) {
    const response: any = await api.post('/auth/login', { phone, password });
    return response;
  },

  async register(data: any) {
    const response: any = await api.post('/auth/register', data);
    return response;
  },

  async getProfile() {
    const response: any = await api.get('/auth/profile');
    return response;
  },
};
