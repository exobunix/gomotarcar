import api from './api';
import { ApiResponse, WalletData, WalletTransaction } from '../types/navigation';

const BASE = '/wallet';

export const walletService = {
  getWallet: async (ownerType: string, ownerId: string): Promise<ApiResponse<WalletData>> => {
    const res = await api.get(`${BASE}/${ownerType}/${ownerId}`);
    return res.data;
  },

  getTransactions: async (ownerType: string, ownerId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<ApiResponse<WalletTransaction[]>> => {
    const res = await api.get(`${BASE}/${ownerType}/${ownerId}/transactions`, { params });
    return res.data;
  },

  createTopUpOrder: async (amount: number): Promise<ApiResponse<{ orderId: string; amount: number }>> => {
    const res = await api.post('/payments/wallet-topup', { amount });
    return res.data;
  },
};
