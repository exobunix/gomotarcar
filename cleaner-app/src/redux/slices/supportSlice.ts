import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supportService } from '../../services/support.service';
import { SupportTicket } from '../../types/navigation';

interface SupportState {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  supervisor: { name: string; phone: string; email?: string } | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [], selectedTicket: null, supervisor: null, loading: false, error: null,
};

export const fetchSupervisor = createAsyncThunk('support/supervisor', async (_, { rejectWithValue }) => {
  try { const res = await supportService.getSupervisorContact(); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

export const fetchTickets = createAsyncThunk('support/tickets', async (_, { rejectWithValue }) => {
  try { const res = await supportService.getTickets(); return res.data; }
  catch { return rejectWithValue('Failed'); }
});

export const createTicket = createAsyncThunk('support/createTicket', async (data: { subject: string; description: string; category: string; priority?: string }, { rejectWithValue }) => {
  try { const res = await supportService.createTicket(data); return res.data; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupervisor.fulfilled, (s, a) => { s.supervisor = a.payload; })
      .addCase(fetchTickets.pending, (s) => { s.loading = true; })
      .addCase(fetchTickets.fulfilled, (s, a) => { s.loading = false; s.tickets = a.payload; })
      .addCase(fetchTickets.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createTicket.fulfilled, (s, a) => { s.tickets.unshift(a.payload); });
  },
});

export const { clearError } = supportSlice.actions;
export default supportSlice.reducer;
