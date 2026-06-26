import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { incentivesService } from '../../services/incentives.service';
import { IncentiveData, LeaderboardEntry } from '../../types/navigation';

interface IncentivesState {
  incentives: IncentiveData[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: IncentivesState = {
  incentives: [], leaderboard: [], loading: false, error: null,
};

export const fetchIncentives = createAsyncThunk('incentives/fetch', async (_, { rejectWithValue }) => {
  try { const res = await incentivesService.getIncentives(); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchLeaderboard = createAsyncThunk('incentives/leaderboard', async (period?: 'month' | 'all', { rejectWithValue }) => {
  try { const res = await incentivesService.getLeaderboard(period); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

const incentivesSlice = createSlice({
  name: 'incentives',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncentives.pending, (s) => { s.loading = true; })
      .addCase(fetchIncentives.fulfilled, (s, a) => { s.loading = false; s.incentives = a.payload; })
      .addCase(fetchIncentives.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchLeaderboard.fulfilled, (s, a) => { s.leaderboard = a.payload; });
  },
});

export const { clearError } = incentivesSlice.actions;
export default incentivesSlice.reducer;
