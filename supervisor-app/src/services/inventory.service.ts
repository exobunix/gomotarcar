import api from './api';

export const inventoryService = {
  list: () => api.get('/supervisor/me/inventory'),
  allocate: (data: { cleanerId: string; itemId: string; quantity: number }) => 
    api.post('/supervisor/me/inventory/allocate', data),
  restock: (data: { itemId: string; quantity: number }) => 
    api.post('/supervisor/me/inventory/restock', data),
};

export default inventoryService;
