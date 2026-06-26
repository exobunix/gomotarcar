import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cleanerService } from '../../services/cleaner.service';
import { CleanerItem } from '../../types/navigation';

interface CleanerState {
  cleaners: CleanerItem[];
  selectedCleaner: CleanerItem | null;
  loading: boolean;
  stats: any;
  error: string | null;
}

const initialState: CleanerState = {
  cleaners: [],
  selectedCleaner: null,
  loading: false,
  stats: null,
  error: null,
};

export const fetchCleaners = createAsyncThunk('cleaners/fetch', async (params?: any) => {
  const res = await cleanerService.list(params);
  return res.data.data;
});

export const fetchCleanerById = createAsyncThunk('cleaners/fetchById', async (id: string) => {
  const res = await cleanerService.getById(id);
  return res.data.data;
});

export const fetchCleanerStats = createAsyncThunk('cleaners/fetchStats', async () => {
  const res = await cleanerService.getStats();
  return res.data.data;
});

const cleanerSlice = createSlice({
  name: 'cleaners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCleaners.pending, (state) => { state.loading = true; })
      .addCase(fetchCleaners.fulfilled, (state, action) => { state.loading = false; state.cleaners = action.payload; })
      .addCase(fetchCleaners.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchCleanerById.pending, (state) => { state.loading = true; })
      .addCase(fetchCleanerById.fulfilled, (state, action) => { state.loading = false; state.selectedCleaner = action.payload; })
      .addCase(fetchCleanerById.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchCleanerStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export default cleanerSlice.reducer;
