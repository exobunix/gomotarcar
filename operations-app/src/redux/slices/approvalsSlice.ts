import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  pendingCleaners: [],
  pendingSupervisors: [],
  pendingFranchises: [],
  pendingNCSPs: [],
  loading: false,
};

import { adminService } from '../../services/admin.service';

export const fetchPendingApprovals = createAsyncThunk('approvals/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [cleaners, supervisors, franchises] = await Promise.all([
      adminService.getCleaners({ verificationStatus: 'pending' }),
      adminService.getSupervisors({ status: 'pending' }),
      adminService.getFranchises({ verificationStatus: 'pending' }),
    ]);
    return { cleaners: cleaners.data?.items || [], supervisors: supervisors.data?.items || [], franchises: franchises.data?.items || [] };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const approvalsSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingApprovals.pending, (state) => { state.loading = true; })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCleaners = action.payload.cleaners;
        state.pendingSupervisors = action.payload.supervisors;
        state.pendingFranchises = action.payload.franchises;
      })
      .addCase(fetchPendingApprovals.rejected, (state) => { state.loading = false; });
  },
});

export default approvalsSlice.reducer;
