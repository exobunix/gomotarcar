import api from './api';

export const inventoryService = {
  list: (params?: any) => api.get('/qr/inventory', { params }), // uses QR/supply stock endpoint
  getById: (id: string) => api.get(`/qr/inventory/${id}`),
  // Fallback: try dedicated inventory if available
  getStock: (params?: any) => api.get('/inventory', { params }).catch(() => api.get('/qr/inventory', { params })),
  allocate: (id: string, data: any) => api.post(`/inventory/${id}/allocate`, data),
  restock: (id: string, data: any) => api.patch(`/inventory/${id}/restock`, data),
};

export default inventoryService;
