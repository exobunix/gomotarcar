import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  tickets: [],
  grievances: [],
  loading: false,
};

import { issueService } from '../../services/issue.service';

export const fetchSupportTickets = createAsyncThunk('support/fetchTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await issueService.getIssues({ status: 'open' });
    return response.data?.items || response.data || [];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupportTickets.pending, (state) => { state.loading = true; })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload; })
      .addCase(fetchSupportTickets.rejected, (state) => { state.loading = false; });
  },
});

export default supportSlice.reducer;
