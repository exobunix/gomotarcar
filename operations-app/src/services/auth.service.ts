import { api } from './api';

export const authService = {
  login: async (credentials: { phone: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },
  logout: async () => {
    return api.post('/auth/logout');
  },
  refresh: async (refreshToken: string) => {
    return api.post('/auth/refresh', { refreshToken });
  },
};
