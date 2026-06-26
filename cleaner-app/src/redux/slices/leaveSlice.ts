import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaveService } from '../../services/leave.service';
import { LeaveRequest, LeaveBalance } from '../../types/navigation';

interface LeaveState {
  leaves: LeaveRequest[];
  selectedLeave: LeaveRequest | null;
  balance: LeaveBalance | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  leaves: [], selectedLeave: null, balance: null, loading: false, error: null,
};

export const fetchLeaves = createAsyncThunk('leave/fetch', async (_, { rejectWithValue }) => {
  try { const res = await leaveService.list(); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchLeaveBalance = createAsyncThunk('leave/balance', async (_, { rejectWithValue }) => {
  try { const res = await leaveService.getBalance(); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

export const applyLeave = createAsyncThunk('leave/apply', async (data: { fromDate: string; toDate: string; reason: string; type: string }, { rejectWithValue }) => {
  try { const res = await leaveService.apply(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchLeaves.fulfilled, (s, a) => { s.loading = false; s.leaves = a.payload; })
      .addCase(fetchLeaves.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchLeaveBalance.fulfilled, (s, a) => { s.balance = a.payload; })
      .addCase(applyLeave.fulfilled, (s, a) => { s.leaves.unshift(a.payload); });
  },
});

export const { clearError } = leaveSlice.actions;
export default leaveSlice.reducer;
