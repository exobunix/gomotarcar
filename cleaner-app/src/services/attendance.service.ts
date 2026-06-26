import api from './api';
import { ApiResponse, AttendanceRecord } from '../types/navigation';

const BASE = '/attendance';

export const attendanceService = {
  checkIn: async (data: { latitude: number; longitude: number; photo?: string }): Promise<ApiResponse<AttendanceRecord>> => {
    const res = await api.post(`${BASE}/checkin`, data);
    return res.data;
  },

  checkOut: async (data?: { latitude?: number; longitude?: number }): Promise<ApiResponse<AttendanceRecord>> => {
    const res = await api.post(`${BASE}/checkout`, data || {});
    return res.data;
  },

  getToday: async (cleanerId: string): Promise<ApiResponse<AttendanceRecord | null>> => {
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/today`);
    return res.data;
  },

  getMonthly: async (cleanerId: string, month: number, year: number): Promise<ApiResponse<AttendanceRecord[]>> => {
    const res = await api.get(`${BASE}/cleaner/${cleanerId}/monthly/${month}/${year}`);
    return res.data;
  },
};
