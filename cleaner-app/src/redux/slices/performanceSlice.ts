import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { performanceService } from '../../services/performance.service';
import { PerformanceData, Achievement } from '../../types/navigation';

interface PerformanceState {
  data: PerformanceData | null;
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  data: null, achievements: [], loading: false, error: null,
};

export const fetchPerformance = createAsyncThunk(
  'performance/fetch',
  async ({ cleanerId, period }: { cleanerId: string; period?: 'week' | 'month' | 'all' }, { rejectWithValue }) => {
    try {
      const res = await performanceService.getPerformance(cleanerId, period);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const fetchAchievements = createAsyncThunk('performance/achievements', async (_, { rejectWithValue }) => {
  try { const res = await performanceService.getAchievements(); return res.data?.data !== undefined ? res.data.data : res.data; }
  catch { return rejectWithValue('Failed'); }
});

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPerformance.pending, (s) => { s.loading = true; })
      .addCase(fetchPerformance.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchPerformance.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchAchievements.fulfilled, (s, a) => { s.achievements = a.payload; });
  },
});

export const { clearError } = performanceSlice.actions;
export default performanceSlice.reducer;
