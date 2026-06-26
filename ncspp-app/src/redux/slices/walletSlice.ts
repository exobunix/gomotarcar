import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletService } from '../../services/wallet.service';

interface WalletState {
  wallet: any | null;
  transactions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWallet();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
    }
  },
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await walletService.getTransactions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },
);

export const requestPayout = createAsyncThunk(
  'wallet/requestPayout',
  async (data: { amount: number; upiId?: string }, { rejectWithValue }) => {
    try {
      const response = await walletService.requestPayout(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request payout');
    }
  },
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = Array.isArray(action.payload) ? action.payload : action.payload?.transactions || [];
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(requestPayout.fulfilled, (state) => {
        // WalletScreen handles refresh after payout
      });
  },
});

export const { clearError } = walletSlice.actions;
export default walletSlice.reducer;
