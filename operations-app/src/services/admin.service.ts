import { api } from './api';

export const adminService = {
  getCleaners: async (params?: any) => api.get('/admin/cleaners', { params }),
  getSupervisors: async (params?: any) => api.get('/supervisor', { params }),
  getFranchises: async (params?: any) => api.get('/franchise', { params }),
  verifyCleaner: async (id: string, data: any) => api.patch(`/admin/cleaners/${id}/verify`, data),
  verifyFranchise: async (id: string, data: any) => api.patch(`/franchise/${id}/verify`, data),
};
