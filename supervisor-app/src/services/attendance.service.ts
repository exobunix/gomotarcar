import api from './api';

export const attendanceService = {
  list: (params?: any) => api.get('/attendance', { params }),
  getStats: (params?: any) => api.get('/attendance/stats', { params }),
  checkIn: (cleanerId: string, data: any) => api.post(`/attendance/cleaner/${cleanerId}/checkin`, data),
  checkOut: (cleanerId: string, data: any) => api.post(`/attendance/cleaner/${cleanerId}/checkout`, data),
  markAbsent: (cleanerId: string, data: any) => api.post(`/attendance/cleaner/${cleanerId}/mark-absent`, data),
};

export default attendanceService;
