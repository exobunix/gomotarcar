import { api } from './api';

export const issueService = {
  getIssues: async (params?: any) => api.get('/issues', { params }),
  getIssueById: async (id: string) => api.get(`/issues/${id}`),
  assignIssue: async (id: string, data: any) => api.patch(`/admin/issues/${id}/assign`, data),
  resolveIssue: async (id: string, data: any) => api.patch(`/admin/issues/${id}/resolve`, data),
};
