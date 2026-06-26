import api from './api';
import { ApiResponse, TrainingVideo, TrainingCategory } from '../types/navigation';

const BASE = '/training';

export const trainingService = {
  getVideos: async (cleanerId?: string): Promise<ApiResponse<TrainingVideo[]>> => {
    const res = await api.get(BASE, { params: cleanerId ? { cleanerId } : {} });
    return res.data;
  },

  getVideos: async (category?: string): Promise<ApiResponse<TrainingVideo[]>> => {
    const res = await api.get(BASE, { params: { category } });
    return res.data;
  },

  getVideoById: async (id: string): Promise<ApiResponse<TrainingVideo>> => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  trackProgress: async (cleanerId: string, videoId: string, data: { completed: boolean; score?: number }): Promise<ApiResponse<any>> => {
    const res = await api.post(`${BASE}/${cleanerId}/progress/${videoId}`, data);
    return res.data;
  },
};
