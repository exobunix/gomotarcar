import api from './api';

export const walletService = {
  getBalance: (ownerType: string, ownerId: string) => api.get(`/wallet/${ownerType}/${ownerId}`).then(r => r.data.data),
  getTransactions: (ownerType: string, ownerId: string, params?: any) =>
    api.get(`/wallet/${ownerType}/${ownerId}/transactions`, { params }).then(r => r.data.data),
};

export default walletService;
