import { api } from './api';

export const invoiceService = {
  async generate(bookingId: string) {
    const response: any = await api.post(`/invoices/generate/${bookingId}`);
    return response;
  },

  async getByBooking(bookingId: string) {
    const response: any = await api.get(`/invoices/booking/${bookingId}`);
    return response;
  },

  async list(params?: any) {
    const response: any = await api.get('/invoices', { params });
    return response;
  },
};
