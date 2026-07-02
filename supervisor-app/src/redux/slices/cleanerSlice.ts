import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cleanerService } from '../../services/cleaner.service';
import { CleanerItem } from '../../types/navigation';

interface CleanerState {
  cleaners: CleanerItem[];
  selectedCleaner: CleanerItem | null;
  loading: boolean;
  approving: string | null; // ID being approved
  stats: any;
  error: string | null;
}

const initialState: CleanerState = {
  cleaners: [],
  selectedCleaner: null,
  loading: false,
  approving: null,
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

export const approveCleaner = createAsyncThunk('cleaners/approve', async (id: string) => {
  const res = await cleanerService.verify(id);
  return res.data.data;
});

const cleanerSlice = createSlice({
  name: 'cleaners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCleaners.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCleaners.fulfilled, (state, action) => {
        state.loading = false;
        state.cleaners = action.payload || [];
      })
      .addCase(fetchCleaners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchCleanerById.pending, (state) => { state.loading = true; })
      .addCase(fetchCleanerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCleaner = action.payload;
      })
      .addCase(fetchCleanerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchCleanerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(approveCleaner.pending, (state, action) => {
        state.approving = action.meta.arg;
      })
      .addCase(approveCleaner.fulfilled, (state, action) => {
        state.approving = null;
        // Update in-place so UI reflects immediately
        const idx = state.cleaners.findIndex(c => c._id === action.payload?._id);
        if (idx >= 0) {
          state.cleaners[idx] = { ...state.cleaners[idx], verificationStatus: 'verified' };
        }
        if (state.selectedCleaner?._id === action.payload?._id) {
          state.selectedCleaner = { ...state.selectedCleaner, verificationStatus: 'verified' };
        }
      })
      .addCase(approveCleaner.rejected, (state) => {
        state.approving = null;
      });
  },
});

export default cleanerSlice.reducer;
