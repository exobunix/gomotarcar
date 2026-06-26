import { api } from './api';

export const warrantyService = {
  async list(params?: any) {
    const response: any = await api.get('/complaints', { params });
    return response;
  },

  async getById(id: string) {
    const response: any = await api.get(`/complaints/${id}`);
    return response;
  },

  async create(data: any) {
    const response: any = await api.post('/complaints', data);
    return response;
  },
};
