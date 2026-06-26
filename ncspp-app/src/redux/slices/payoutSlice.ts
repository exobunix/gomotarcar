import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payoutService } from '../../services/payout.service';

interface PayoutState {
  payouts: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PayoutState = {
  payouts: [],
  loading: false,
  error: null,
};

export const fetchPayouts = createAsyncThunk(
  'payout/fetchPayouts',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await payoutService.getPayouts(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payouts');
    }
  },
);

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts = Array.isArray(action.payload) ? action.payload : action.payload?.payouts || [];
      })
      .addCase(fetchPayouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = payoutSlice.actions;
export default payoutSlice.reducer;
