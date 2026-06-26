import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadService } from '../../services/lead.service';

interface LeadState {
  leads: any[];
  selectedLead: any | null;
  analytics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeadState = {
  leads: [],
  selectedLead: null,
  analytics: null,
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  'lead/fetchLeads',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await leadService.getLeads(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  },
);

export const fetchLeadById = createAsyncThunk(
  'lead/fetchLeadById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await leadService.getLeadById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
    }
  },
);

export const updateLeadStatus = createAsyncThunk(
  'lead/updateLeadStatus',
  async ({ id, status, notes }: { id: string; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await leadService.updateLeadStatus(id, status, notes);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead status');
    }
  },
);

export const fetchLeadAnalytics = createAsyncThunk(
  'lead/fetchLeadAnalytics',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await leadService.getAnalytics(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },
);

const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedLead(state) {
      state.selectedLead = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = Array.isArray(action.payload) ? action.payload : action.payload?.leads || [];
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l: any) => l._id === action.payload._id);
        if (index !== -1) state.leads[index] = action.payload;
        if (state.selectedLead?._id === action.payload._id) {
          state.selectedLead = action.payload;
        }
      })
      .addCase(fetchLeadAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError, clearSelectedLead } = leadSlice.actions;
export default leadSlice.reducer;
