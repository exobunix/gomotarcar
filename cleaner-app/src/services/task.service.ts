import api from './api';
import { ApiResponse, TaskItem } from '../types/navigation';

const BASE = '/tasks';

export const taskService = {
  getTodayTasks: async (cleanerId: string): Promise<ApiResponse<TaskItem[]>> => {
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/today`);
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<TaskItem>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  startTask: async (id: string): Promise<ApiResponse<TaskItem>> => {
    const res = await api.patch(`${BASE}/${id}/start`);
    return res.data;
  },

  completeTask: async (id: string, data: { afterPhotos?: string[]; notes?: string }): Promise<ApiResponse<TaskItem>> => {
    const res = await api.patch(`${BASE}/${id}/complete`, data);
    return res.data;
  },

  scanQR: async (code: string): Promise<ApiResponse<{ code: string; status: string; vehicle?: any; customer?: any }>> => {
    const res = await api.post('/qr/scan', { code });
    return res.data;
  },
};
