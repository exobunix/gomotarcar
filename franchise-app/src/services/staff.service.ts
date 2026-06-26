import { api } from './api';

export const staffService = {
  async list(params?: any) {
    const response: any = await api.get('/cleaner', { params });
    return response;
  },

  async getById(id: string) {
    const response: any = await api.get(`/cleaner/${id}`);
    return response;
  },

  async create(data: any) {
    const response: any = await api.post('/cleaner', data);
    return response;
  },

  async update(id: string, data: any) {
    const response: any = await api.put(`/cleaner/${id}`, data);
    return response;
  },

  async delete(id: string) {
    const response: any = await api.delete(`/cleaner/${id}`);
    return response;
  },
};
