import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cleanerService } from '../../services/cleaner.service';
import { EarningsSummary } from '../../types/navigation';

interface EarningsState {
  summary: EarningsSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: EarningsState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchEarnings = createAsyncThunk(
  'earnings/fetch',
  async ({ cleanerId, period }: { cleanerId: string; period?: 'today' | 'week' | 'month' }, { rejectWithValue }) => {
    try {
      const res = await cleanerService.getEarnings(cleanerId, { period });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch earnings');
    }
  }
);

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEarnings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEarnings.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; })
      .addCase(fetchEarnings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = earningsSlice.actions;
export default earningsSlice.reducer;
