import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incentiveService } from '../../services/incentive.service';
import { IncentiveItem } from '../../types/navigation';

interface IncentiveState {
  incentives: IncentiveItem[];
  leaderboard: any[];
  loading: boolean;
  stats: any;
  error: string | null;
}

const initialState: IncentiveState = {
  incentives: [],
  leaderboard: [],
  loading: false,
  stats: null,
  error: null,
};

export const fetchIncentives = createAsyncThunk('incentives/fetch', async (params?: any) => {
  const res = await incentiveService.list(params);
  return res.data.data;
});

export const fetchLeaderboard = createAsyncThunk('incentives/leaderboard', async (params?: any) => {
  const res = await incentiveService.getLeaderboard(params);
  return res.data.data;
});

const incentiveSlice = createSlice({
  name: 'incentives',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncentives.pending, (state) => { state.loading = true; })
      .addCase(fetchIncentives.fulfilled, (state, action) => { state.loading = false; state.incentives = action.payload; })
      .addCase(fetchIncentives.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => { state.leaderboard = action.payload; });
  },
});

export default incentiveSlice.reducer;
