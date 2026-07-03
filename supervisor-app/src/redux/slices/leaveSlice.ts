import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leaveService from '../../services/leave.service';

interface LeaveState {
  leaves: any[];
  stats: any;
  loading: boolean;
  actionLoading: string | null;
  error: string | null;
}

const initialState: LeaveState = {
  leaves: [],
  stats: null,
  loading: false,
  actionLoading: null,
  error: null,
};

export const fetchLeaves = createAsyncThunk('leaves/fetch', async (params?: any) => {
  const res = await leaveService.list(params);
  return res.data.data;
});

export const fetchLeaveStats = createAsyncThunk('leaves/stats', async () => {
  const res = await leaveService.getStats();
  return res.data.data;
});

export const approveLeave = createAsyncThunk('leaves/approve', async ({ id, data }: { id: string; data?: any }) => {
  const res = await leaveService.approve(id, data);
  return res.data.data;
});

export const rejectLeave = createAsyncThunk('leaves/reject', async ({ id, data }: { id: string; data?: any }) => {
  const res = await leaveService.reject(id, data);
  return res.data.data;
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLeaves.fulfilled, (state, action) => { state.loading = false; state.leaves = action.payload || []; })
      .addCase(fetchLeaves.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(fetchLeaveStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(approveLeave.pending, (state, action) => { state.actionLoading = action.meta.arg.id; })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.leaves = state.leaves.map(l => l._id === action.payload?._id ? action.payload : l);
      })
      .addCase(approveLeave.rejected, (state) => { state.actionLoading = null; })
      .addCase(rejectLeave.pending, (state, action) => { state.actionLoading = action.meta.arg.id; })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.leaves = state.leaves.map(l => l._id === action.payload?._id ? action.payload : l);
      })
      .addCase(rejectLeave.rejected, (state) => { state.actionLoading = null; });
  },
});

export default leaveSlice.reducer;
