import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletService } from '../../services/wallet.service';
import { WalletData, WalletTransaction } from '../../types/navigation';

interface WalletState {
  wallet: WalletData | null;
  transactions: WalletTransaction[];
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
  'wallet/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await walletService.getWallet();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wallet');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (params: { page?: number; limit?: number; type?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await walletService.getTransactions(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWallet.fulfilled, (state, action) => { state.loading = false; state.wallet = action.payload; })
      .addCase(fetchWallet.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; })
      .addCase(fetchTransactions.fulfilled, (state, action) => { state.loading = false; state.transactions = action.payload; })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = walletSlice.actions;
export default walletSlice.reducer;
